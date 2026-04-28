package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "kampuspro")
	sslmode := getEnv("DB_SSLMODE", "disable")

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode,
	)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to open database: ", err)
	}

	// Connection pool configuration
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(2 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Database connected successfully")

	// Ensure required tables exist
	_, err = db.ExecContext(context.Background(), `
		CREATE TABLE IF NOT EXISTS site_settings (
			key TEXT PRIMARY KEY,
			value JSONB NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		)
	`)
	if err != nil {
		log.Fatal("Failed to create site_settings table: ", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func ensureSuperAdmin(email, password, fullName string) error {
	_, err := db.ExecContext(context.Background(),
		`INSERT INTO users (email, password_hash, full_name, role)
		VALUES ($1, crypt($2, gen_salt('bf')), $3, 'admin')
		ON CONFLICT (email) DO UPDATE
		SET password_hash = crypt($2, gen_salt('bf')), role = 'admin', full_name = COALESCE(NULLIF($3, ''), users.full_name), updated_at = NOW()`,
		email, password, fullName)
	return err
}
