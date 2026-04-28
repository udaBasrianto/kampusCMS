package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages []ChatMessage `json:"messages"`
}

type ChatbotSettings struct {
	Enabled      bool   `json:"enabled"`
	ApiKey       string `json:"api_key"`
	Provider     string `json:"provider"`
	SystemPrompt string `json:"system_prompt"`
}

type GeminiMessage struct {
	Role  string `json:"role"`
	Parts []struct {
		Text string `json:"text"`
	} `json:"parts"`
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
	err := db.QueryRowContext(context.Background(), "SELECT setting_value FROM site_settings WHERE setting_key = 'chatbot'").Scan(&settingJSON)
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

	if settings.Provider == "gemini" {
		reply, err := callGeminiAPI(settings.ApiKey, settings.SystemPrompt, req.Messages)
		if err != nil {
			log.Println("Gemini API Error:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to communicate with AI provider"})
		}
		return c.JSON(fiber.Map{
			"status": "success",
			"reply":  reply,
		})
	}

	// Add more providers here (OpenAI, DeepSeek, Groq, etc) in the future based on the Provider Pattern
	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Unsupported AI provider"})
}

func callGeminiAPI(apiKey, systemPrompt string, messages []ChatMessage) (string, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s", apiKey)

	var history []GeminiMessage
	for _, msg := range messages {
		// Convert roles to match Gemini format (user -> user, assistant -> model)
		role := "user"
		if msg.Role == "assistant" {
			role = "model"
		}
		
		// Skip empty content
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
