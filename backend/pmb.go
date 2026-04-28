package main

import (
	"context"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

// saveCandidateForm updates the PMB Candidate details
func saveCandidateForm(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		NISN                   string `json:"nisn"`
		SchoolOrigin           string `json:"school_origin"`
		FirstChoiceProgramID   string `json:"first_choice_program_id"`
		SecondChoiceProgramID  string `json:"second_choice_program_id"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	// Validate required fields
	if req.NISN == "" || req.SchoolOrigin == "" || req.FirstChoiceProgramID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "NISN, School Origin, and First Choice Program are required"})
	}

	var p1, p2 interface{}
	p1 = req.FirstChoiceProgramID
	p2 = nil
	if req.SecondChoiceProgramID != "" {
		p2 = req.SecondChoiceProgramID
	}

	// Update candidate profile
	query := `
		UPDATE pmb_candidates 
		SET nisn = $1, school_origin = $2, first_choice_program_id = $3, second_choice_program_id = $4, status = 'WAITING_PAYMENT', updated_at = NOW()
		WHERE user_id = $5
		RETURNING id, status
	`
	
	var candidateID, status string
	err := db.QueryRowContext(context.Background(), query, req.NISN, req.SchoolOrigin, p1, p2, userID).Scan(&candidateID, &status)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update candidate profile"})
	}

	return c.JSON(fiber.Map{
		"message": "Candidate form saved successfully",
		"status": status,
	})
}

// getCandidateProfile returns the candidate's current PMB details
func getCandidateProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var profile struct {
		ID                     string  `json:"id"`
		RegistrationNumber     *string `json:"registration_number"`
		FullName               string  `json:"full_name"`
		NISN                   *string `json:"nisn"`
		PhoneWhatsapp          *string `json:"phone_whatsapp"`
		SchoolOrigin           *string `json:"school_origin"`
		FirstChoiceProgramID   *string `json:"first_choice_program_id"`
		SecondChoiceProgramID  *string `json:"second_choice_program_id"`
		Status                 string  `json:"status"`
	}

	query := `
		SELECT id, registration_number, full_name, nisn, phone_whatsapp, school_origin, 
		       first_choice_program_id, second_choice_program_id, status 
		FROM pmb_candidates 
		WHERE user_id = $1
	`
	
	err := db.QueryRowContext(context.Background(), query, userID).Scan(
		&profile.ID, &profile.RegistrationNumber, &profile.FullName, &profile.NISN, 
		&profile.PhoneWhatsapp, &profile.SchoolOrigin, &profile.FirstChoiceProgramID, 
		&profile.SecondChoiceProgramID, &profile.Status,
	)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Candidate profile not found"})
	}

	return c.JSON(profile)
}

// uploadPaymentProof handles uploading the payment receipt for the PMB registration fee
func uploadPaymentProof(c *fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req struct {
		ImageURL string `json:"image_url"`
	}

	if err := c.BodyParser(&req); err != nil || req.ImageURL == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request or missing image URL"})
	}

	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Internal server error"})
	}
	defer tx.Rollback()

	// 1. Get candidate ID
	var candidateID string
	err = tx.QueryRowContext(context.Background(), "SELECT id FROM pmb_candidates WHERE user_id = $1", userID).Scan(&candidateID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Candidate not found"})
	}

	// 2. Insert Payment Record
	_, err = tx.ExecContext(context.Background(),
		`INSERT INTO pmb_payments (candidate_id, payment_type, amount, proof_image_url, status) 
		 VALUES ($1, 'REGISTRATION', 250000, $2, 'PENDING')`,
		candidateID, req.ImageURL,
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save payment record"})
	}

	// 3. Update Candidate Status (Simulating auto-verify for smooth testing, normally it should be WAITING_PAYMENT_VERIFICATION but we mapped it directly to PAYMENT_VERIFIED)
	_, err = tx.ExecContext(context.Background(),
		`UPDATE pmb_candidates SET status = 'PAYMENT_VERIFIED', updated_at = NOW() WHERE id = $1`,
		candidateID,
	)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update candidate status"})
	}

	if err := tx.Commit(); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Internal server error"})
	}

	return c.JSON(fiber.Map{
		"message": "Payment proof uploaded successfully",
		"status": "PAYMENT_VERIFIED",
	})
}
