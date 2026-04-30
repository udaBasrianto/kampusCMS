package main

import (
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	initDB()
	initJWTSecret()

	if err := ensureSuperAdmin("mas@abd.com", "mas@abd.com", "Super Admin"); err != nil {
		log.Fatal("Failed to ensure super admin:", err)
	}

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			// Don't leak internal error details to clients
			return c.Status(code).JSON(fiber.Map{
				"error": "An internal error occurred",
			})
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: getEnv("CORS_ORIGINS", "*"),
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))
	app.Static("/uploads", filepath.Join("..", "public", "uploads"))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		if err := db.Ping(); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"status": "unhealthy"})
		}
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// API routes
	api := app.Group("/api/v1")

	// Setup routes
	setupRoutes(api)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		log.Println("Shutting down gracefully...")
		_ = app.Shutdown()
		_ = db.Close()
		log.Println("Shutdown complete")
	}()

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func setupRoutes(api fiber.Router) {
	// Auth routes
	api.Post("/auth/login", login)
	api.Post("/auth/register", registerUser)
	api.Post("/auth/logout", logout)
	api.Post("/auth/register-candidate", registerCandidate)
	api.Get("/auth/me", authMiddleware, getMe)

	// Public routes
	api.Get("/hero-slides", getHeroSlides)
	api.Get("/faculties", getFaculties)
	api.Get("/faculties/:slug", getFacultyBySlug)
	api.Get("/programs", getPrograms)
	api.Get("/lecturers", getLecturers)
	api.Get("/news", getNews)
	api.Get("/news/:id", getNewsByID)
	api.Get("/testimonials", getTestimonials)
	api.Get("/events", getEvents)
	api.Get("/events/:id", getEventByID)
	api.Get("/blog", getBlogPosts)
	api.Get("/blog/:slug", getBlogPostBySlug)
	api.Get("/pages", getPages)
	api.Get("/pages/:slug", getPageBySlug)
	api.Post("/contact", submitContact)
	api.Post("/chat", handleChat)

	// PMB routes (protected for candidate)
	pmb := api.Group("/pmb", authMiddleware, requireRole("candidate", "admin"))
	pmb.Get("/candidate-profile", getCandidateProfile)
	pmb.Post("/candidate-form", saveCandidateForm)
	pmb.Post("/payment", uploadPaymentProof)

	// Admin routes (protected)
	admin := api.Group("/admin", authMiddleware, requireRole("admin"))
	admin.Get("/dashboard", getDashboardStats)
	admin.Get("/analytics", getAnalytics)
	admin.Post("/uploads", uploadFile)
	admin.Get("/messages", getMessages)
	admin.Put("/messages/:id/read", markMessageRead)
	admin.Delete("/messages/:id", deleteMessage)
	admin.Get("/users", getUsers)
	admin.Post("/users", createUser)
	admin.Put("/users/:id", updateUser)
	admin.Delete("/users/:id", deleteUser)
	admin.Get("/settings", getSettings)
	admin.Put("/settings", updateSettings)
	admin.Post("/chatbot-models", fetchChatbotModels)
	admin.Post("/chatbot-knowledge", handleKnowledgeUpload)
	admin.Get("/:table", getRows)
	admin.Post("/:table", createRow)
	admin.Put("/:table/:id", updateRow)
	admin.Delete("/:table/:id", deleteRow)
}
