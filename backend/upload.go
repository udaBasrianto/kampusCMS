package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

var safePathPart = regexp.MustCompile(`[^a-zA-Z0-9_-]+`)

// Allowed file extensions for upload
var allowedExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
	".webp": true, ".svg": true, ".pdf": true, ".ico": true,
}

// Max file size: 10MB
const maxFileSize = 10 * 1024 * 1024

func cleanPathPart(value string) string {
	value = safePathPart.ReplaceAllString(value, "-")
	value = strings.Trim(value, "-")
	if value == "" {
		return "media"
	}
	return value
}

func uploadFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "file is required"})
	}

	// Validate file size
	if file.Size > maxFileSize {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "file too large, maximum 10MB"})
	}

	folder := cleanPathPart(c.FormValue("folder", "media"))
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext == "" {
		ext = ".jpg"
	}

	// Validate file extension
	if !allowedExtensions[ext] {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "file type not allowed. Allowed: jpg, jpeg, png, gif, webp, svg, pdf, ico",
		})
	}

	name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	dir := filepath.Join("..", "public", "uploads", folder)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create upload directory"})
	}

	target := filepath.Join(dir, name)
	if err := c.SaveFile(file, target); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save file"})
	}

	return c.JSON(fiber.Map{"url": "/uploads/" + folder + "/" + name})
}
