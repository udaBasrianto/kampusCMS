package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// fetchChatbotModels proxies a GET /v1/models request to the AI provider
// so the admin UI can show the real model list.
func fetchChatbotModels(c *fiber.Ctx) error {
	var req struct {
		ApiUrl string `json:"api_url"`
		ApiKey string `json:"api_key"`
	}
	if err := c.BodyParser(&req); err != nil {
		log.Println("BodyParser error in fetchChatbotModels:", err, "Body:", string(c.Body()))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request: " + err.Error()})
	}
	if req.ApiKey == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "API key is required"})
	}

	// Derive the /v1/models URL from the chat completions URL
	baseURL := req.ApiUrl
	if baseURL == "" {
		baseURL = "https://ai.sumopod.com/v1/chat/completions"
	}
	// Strip /chat/completions to get /v1/models
	modelsURL := strings.TrimSuffix(baseURL, "/chat/completions")
	modelsURL = strings.TrimSuffix(modelsURL, "/") + "/models"

	httpReq, err := http.NewRequest("GET", modelsURL, nil)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to build request"})
	}
	httpReq.Header.Set("Authorization", "Bearer "+req.ApiKey)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		log.Println("fetchChatbotModels error:", err)
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "Failed to connect to AI provider"})
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return c.Status(resp.StatusCode).JSON(fiber.Map{
			"error": fmt.Sprintf("Provider returned status %d", resp.StatusCode),
		})
	}

	// Forward the JSON response as-is
	c.Set("Content-Type", "application/json")
	return c.Send(body)
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages []ChatMessage `json:"messages"`
}

type ChatbotSettings struct {
	Enabled        bool              `json:"enabled"`
	ApiKey         string            `json:"api_key"`
	ApiUrl         string            `json:"api_url"`
	Model          string            `json:"model"`
	Provider       string            `json:"provider"`
	SystemPrompt   string            `json:"system_prompt"`
	KnowledgeFiles []KnowledgeFile   `json:"knowledge_files"`
}

// buildFullPrompt combines the system prompt with knowledge file contents
func buildFullPrompt(settings ChatbotSettings) string {
	prompt := settings.SystemPrompt
	if len(settings.KnowledgeFiles) == 0 {
		return prompt
	}

	var sb strings.Builder
	sb.WriteString(prompt)
	sb.WriteString("\n\n--- KNOWLEDGE BASE (gunakan informasi berikut untuk menjawab pertanyaan) ---\n")
	for _, kf := range settings.KnowledgeFiles {
		if kf.Content == "" {
			continue
		}
		sb.WriteString(fmt.Sprintf("\n### Dokumen: %s\n", kf.Name))
		sb.WriteString(kf.Content)
		sb.WriteString("\n")
	}
	sb.WriteString("\n--- AKHIR KNOWLEDGE BASE ---")
	return sb.String()
}

func handleChat(c *fiber.Ctx) error {
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if len(req.Messages) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Messages array cannot be empty"})
	}

	// Fetch chatbot settings from the database
	var settingJSON []byte
	err := db.QueryRowContext(context.Background(), "SELECT value FROM site_settings WHERE key = 'chatbot'").Scan(&settingJSON)
	if err != nil {
		log.Println("Chatbot settings not found or error:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Chatbot is not configured"})
	}

	var settings ChatbotSettings
	if err := json.Unmarshal(settingJSON, &settings); err != nil {
		log.Println("Failed to parse chatbot settings:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Invalid chatbot settings"})
	}

	if !settings.Enabled {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Chatbot is currently disabled"})
	}

	if settings.ApiKey == "" {
		// Mock response if API key is not set
		time.Sleep(1 * time.Second)
		return c.JSON(fiber.Map{
			"status": "success",
			"reply":  "Maaf, fitur AI sedang dalam tahap simulasi karena API Key belum dikonfigurasi di dashboard admin.",
		})
	}

	switch settings.Provider {
	case "openai":
		settings.SystemPrompt = buildFullPrompt(settings)
		reply, err := callOpenAICompatible(settings, req.Messages)
		if err != nil {
			log.Println("OpenAI-compatible API Error:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to communicate with AI provider"})
		}
		return c.JSON(fiber.Map{"status": "success", "reply": reply})

	case "gemini":
		fullPrompt := buildFullPrompt(settings)
		reply, err := callGeminiAPI(settings.ApiKey, fullPrompt, req.Messages)
		if err != nil {
			log.Println("Gemini API Error:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to communicate with AI provider"})
		}
		return c.JSON(fiber.Map{"status": "success", "reply": reply})

	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Unsupported AI provider"})
	}
}

// ─── OpenAI-Compatible API (Sumopod / LiteLLM / OpenAI / etc.) ───

func callOpenAICompatible(settings ChatbotSettings, messages []ChatMessage) (string, error) {
	apiURL := settings.ApiUrl
	if apiURL == "" {
		apiURL = "https://ai.sumopod.com/v1/chat/completions"
	}
	// Normalize: jika hanya base URL (misal /v1), tambahkan /chat/completions
	if !strings.HasSuffix(apiURL, "/chat/completions") {
		apiURL = strings.TrimSuffix(apiURL, "/") + "/chat/completions"
	}
	model := settings.Model
	if model == "" {
		model = "gpt-5-nano"
	}

	// Build messages array with system prompt
	var chatMessages []map[string]string
	if settings.SystemPrompt != "" {
		chatMessages = append(chatMessages, map[string]string{
			"role":    "system",
			"content": settings.SystemPrompt,
		})
	}
	for _, msg := range messages {
		if msg.Content == "" {
			continue
		}
		chatMessages = append(chatMessages, map[string]string{
			"role":    msg.Role,
			"content": msg.Content,
		})
	}

	requestBody := map[string]interface{}{
		"model":    model,
		"messages": chatMessages,
		"temperature":      0.7,
		"max_tokens":       500,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+settings.ApiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("openai-compatible api returned status %d: %s", resp.StatusCode, string(body))
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &response); err != nil {
		return "", err
	}

	if len(response.Choices) > 0 {
		return response.Choices[0].Message.Content, nil
	}

	return "Maaf, saya tidak bisa memberikan jawaban saat ini.", nil
}

// ─── Google Gemini Native API ───

type GeminiMessage struct {
	Role  string `json:"role"`
	Parts []struct {
		Text string `json:"text"`
	} `json:"parts"`
}

func callGeminiAPI(apiKey, systemPrompt string, messages []ChatMessage) (string, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", apiKey)

	var history []GeminiMessage
	for _, msg := range messages {
		role := "user"
		if msg.Role == "assistant" {
			role = "model"
		}
		if msg.Content == "" {
			continue
		}
		history = append(history, GeminiMessage{
			Role: role,
			Parts: []struct {
				Text string `json:"text"`
			}{{Text: msg.Content}},
		})
	}

	requestBody := map[string]interface{}{
		"systemInstruction": map[string]interface{}{
			"parts": []map[string]interface{}{
				{"text": systemPrompt},
			},
		},
		"contents": history,
		"generationConfig": map[string]interface{}{
			"temperature":     0.7,
			"maxOutputTokens": 500,
		},
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("gemini api returned status %d: %s", resp.StatusCode, string(body))
	}

	var response struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.Unmarshal(body, &response); err != nil {
		return "", err
	}

	if len(response.Candidates) > 0 && len(response.Candidates[0].Content.Parts) > 0 {
		return response.Candidates[0].Content.Parts[0].Text, nil
	}

	return "Maaf, saya tidak bisa memberikan jawaban saat ini.", nil
}
