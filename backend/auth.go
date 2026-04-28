package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func initJWTSecret() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Println("WARNING: JWT_SECRET not set. Using insecure default. Set JWT_SECRET in production!")
		secret = "your-secret-key-change-this-in-production"
	}
	if len(secret) < 16 {
		log.Fatal("FATAL: JWT_SECRET must be at least 16 characters long")
	}
	jwtSecret = []byte(secret)
}

func generateToken(userID, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func authMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Missing authorization header",
		})
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == "" || tokenString == authHeader {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token format",
		})
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token",
		})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token claims",
		})
	}

	c.Locals("user_id", claims["user_id"])
	c.Locals("role", claims["role"])

	return c.Next()
}

func login(c *fiber.Ctx) error {
	var req struct {
		Email    string `json:"email" form:"email"`
		Password string `json:"password" form:"password"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Email and password are required",
		})
	}

	var user User
	var passwordHash string
	err := db.QueryRowContext(context.Background(),
		"SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1",
		req.Email,
	).Scan(&user.ID, &user.Email, &passwordHash, &user.FullName, &user.Role)

	if err != nil || !checkPassword(passwordHash, req.Password) {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	token, err := generateToken(user.ID, user.Role)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user":  user,
	})
}

func logout(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}

func getMe(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var user User
	err := db.QueryRowContext(context.Background(),
		"SELECT id, email, full_name, role, created_at FROM users WHERE id = $1",
		userID,
	).Scan(&user.ID, &user.Email, &user.FullName, &user.Role, &user.CreatedAt)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	rows, err := db.QueryContext(context.Background(), "SELECT faculty_id FROM faculty_admins WHERE user_id=$1", user.ID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var facultyID string
			if rows.Scan(&facultyID) == nil {
				user.FacultyIDs = append(user.FacultyIDs, facultyID)
			}
		}
	}

	return c.JSON(user)
}

func requireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role := c.Locals("role")
		if role == nil {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized",
			})
		}

		for _, r := range roles {
			if role == r {
				return c.Next()
			}
		}

		return c.Status(http.StatusForbidden).JSON(fiber.Map{
			"error": "Insufficient permissions",
		})
	}
}

func registerCandidate(c *fiber.Ctx) error {
	var req struct {
		FullName      string `json:"full_name"`
		Email         string `json:"email"`
		Password      string `json:"password"`
		PhoneWhatsapp string `json:"phone_whatsapp"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Email == "" || req.Password == "" || req.FullName == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Email, password, and full name are required",
		})
	}

	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Internal server error"})
	}
	defer tx.Rollback()

	// 1. Create User
	hashed, hashErr := hashPassword(req.Password)
	if hashErr != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create account"})
	}
	var userID string
	err = tx.QueryRowContext(context.Background(),
		`INSERT INTO users (email, password_hash, full_name, role) 
		 VALUES ($1, $2, $3, 'candidate') 
		 RETURNING id`,
		req.Email, hashed, req.FullName,
	).Scan(&userID)
	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") {
			return c.Status(http.StatusConflict).JSON(fiber.Map{"error": "Email already exists"})
		}
		log.Println("Error creating user:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create account"})
	}

	// 2. Create Candidate Profile
	_, err = tx.ExecContext(context.Background(),
		`INSERT INTO pmb_candidates (user_id, full_name, phone_whatsapp) 
		 VALUES ($1, $2, $3)`,
		userID, req.FullName, req.PhoneWhatsapp,
	)
	if err != nil {
		log.Println("Error creating candidate profile:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to setup candidate profile"})
	}

	if err := tx.Commit(); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Internal server error"})
	}

	// Auto login (generate token)
	token, err := generateToken(userID, "candidate")
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Account created but failed to generate token"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"token": token,
		"message": "Candidate registered successfully",
	})
}
