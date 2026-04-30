package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/lib/pq"
)

var tableColumns = map[string]map[string]bool{
	"hero_slides": {
		"title": true, "eyebrow": true, "description": true, "image_url": true,
		"cta_primary_label": true, "cta_primary_href": true, "cta_secondary_label": true,
		"cta_secondary_href": true, "active": true, "sort_order": true,
	},
	"faculties": {
		"code": true, "name": true, "slug": true, "description": true, "vision": true,
		"mission": true, "about_content": true, "hero_title": true, "hero_eyebrow": true,
		"hero_description": true, "cover_image_url": true, "accent": true, "active": true,
		"programs": true, "sort_order": true, "facilities": true, "contact_info": true,
	},
	"faculty_programs": {
		"faculty_id": true, "name": true, "level": true, "description": true,
		"accreditation": true, "duration_years": true, "active": true, "sort_order": true,
	},
	"faculty_lecturers": {
		"faculty_id": true, "name": true, "position": true, "education": true,
		"expertise": true, "photo_url": true, "active": true, "sort_order": true,
	},
	"news": {
		"title": true, "excerpt": true, "content": true, "image_url": true, "category": true,
		"date": true, "featured": true, "active": true,
	},
	"testimonials": {
		"name": true, "role": true, "quote": true, "image_url": true, "year": true,
		"active": true, "sort_order": true,
	},
	"pmb_batches": {
		"name": true, "academic_year": true, "start_date": true, "end_date": true,
		"registration_fee": true, "is_active": true,
	},
	"pmb_candidates": {
		"user_id": true, "batch_id": true, "registration_number": true, "full_name": true,
		"nisn": true, "phone_whatsapp": true, "school_origin": true, 
		"first_choice_program_id": true, "second_choice_program_id": true, "status": true,
	},
	"blog_posts": {
		"title": true, "slug": true, "excerpt": true, "content": true, "cover_image_url": true,
		"author_name": true, "category": true, "tags": true, "faculty_id": true, "status": true,
		"published_at": true, "seo_title": true, "seo_description": true,
	},
	"pages": {
		"title": true, "subtitle": true, "slug": true, "content": true,
		"cover_image_url": true, "published": true, "sort_order": true,
		"seo_title": true, "seo_description": true,
	},
	"campus_events": {
		"title": true, "description": true, "image_url": true, "event_date": true,
		"start_time": true, "end_time": true, "location": true, "map_coordinates": true, "active": true, "sort_order": true,
	},
}

func normalizeValue(column string, value interface{}) (interface{}, error) {
	if value == nil || value == "" {
		if column == "faculty_id" || strings.HasSuffix(column, "_at") {
			return nil, nil
		}
	}

	switch column {
	case "facilities", "contact_info", "value":
		// If value is already raw JSON bytes, use as-is
		if raw, ok := value.(*json.RawMessage); ok && raw != nil {
			return string(*raw), nil
		}
		if raw, ok := value.(json.RawMessage); ok {
			return string(raw), nil
		}
		b, err := json.Marshal(value)
		if err != nil {
			return nil, err
		}
		return string(b), nil
	case "tags":
		items := []string{}
		if arr, ok := value.([]interface{}); ok {
			for _, item := range arr {
				items = append(items, fmt.Sprint(item))
			}
		}
		return pq.Array(items), nil
	default:
		return value, nil
	}
}

func cleanPayload(table string, payload map[string]interface{}) (map[string]interface{}, error) {
	allowed, ok := tableColumns[table]
	if !ok {
		return nil, fmt.Errorf("table is not allowed")
	}

	cleaned := map[string]interface{}{}
	for key, value := range payload {
		if !allowed[key] {
			continue
		}
		normalized, err := normalizeValue(key, value)
		if err != nil {
			return nil, err
		}
		cleaned[key] = normalized
	}
	return cleaned, nil
}

func getRows(c *fiber.Ctx) error {
	table := c.Params("table")

	// Ensure table is whitelisted
	if _, ok := tableColumns[table]; !ok {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "table not allowed"})
	}

	query := fmt.Sprintf("SELECT COALESCE(json_agg(row_to_json(t)), '[]') FROM %s t", table)
	
	var result []byte
	err := db.QueryRowContext(context.Background(), query).Scan(&result)
	if err != nil {
		log.Println("getRows error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch rows"})
	}

	c.Set("Content-Type", "application/json")
	return c.Send(result)
}

func createRow(c *fiber.Ctx) error {
	table := c.Params("table")
	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	cleaned, err := cleanPayload(table, payload)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if len(cleaned) == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "no valid fields"})
	}

	columns := make([]string, 0, len(cleaned))
	for key := range cleaned {
		columns = append(columns, key)
	}
	sort.Strings(columns)

	placeholders := make([]string, len(columns))
	values := make([]interface{}, len(columns))
	for i, column := range columns {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		values[i] = cleaned[column]
	}

	query := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s) RETURNING id",
		table,
		strings.Join(columns, ", "),
		strings.Join(placeholders, ", "),
	)

	var id string
	if err := db.QueryRowContext(context.Background(), query, values...).Scan(&id); err != nil {
		log.Println("createRow error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create record"})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{"id": id})
}

func updateRow(c *fiber.Ctx) error {
	table := c.Params("table")
	id := c.Params("id")
	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	cleaned, err := cleanPayload(table, payload)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if len(cleaned) == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "no valid fields"})
	}

	columns := make([]string, 0, len(cleaned))
	for key := range cleaned {
		columns = append(columns, key)
	}
	sort.Strings(columns)

	assignments := make([]string, len(columns))
	values := make([]interface{}, len(columns)+1)
	for i, column := range columns {
		assignments[i] = fmt.Sprintf("%s=$%d", column, i+1)
		values[i] = cleaned[column]
	}
	values[len(values)-1] = id

	query := fmt.Sprintf(
		"UPDATE %s SET %s, updated_at=NOW() WHERE id=$%d",
		table,
		strings.Join(assignments, ", "),
		len(values),
	)

	if _, err := db.ExecContext(context.Background(), query, values...); err != nil {
		log.Println("updateRow error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update record"})
	}
	return c.JSON(fiber.Map{"message": "Updated successfully"})
}

func deleteRow(c *fiber.Ctx) error {
	table := c.Params("table")
	id := c.Params("id")
	if _, ok := tableColumns[table]; !ok {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "table is not allowed"})
	}

	if _, err := db.ExecContext(context.Background(), fmt.Sprintf("DELETE FROM %s WHERE id=$1", table), id); err != nil {
		log.Println("deleteRow error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete record"})
	}
	return c.JSON(fiber.Map{"message": "Deleted successfully"})
}

func scanRows(rows *sql.Rows) ([]fiber.Map, error) {
	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	result := []fiber.Map{}
	for rows.Next() {
		values := make([]interface{}, len(columns))
		pointers := make([]interface{}, len(columns))
		for i := range values {
			pointers[i] = &values[i]
		}

		if err := rows.Scan(pointers...); err != nil {
			return nil, err
		}

		row := fiber.Map{}
		for i, column := range columns {
			switch v := values[i].(type) {
			case []byte:
				var decoded interface{}
				if json.Valid(v) && json.Unmarshal(v, &decoded) == nil {
					row[column] = decoded
				} else {
					row[column] = string(v)
				}
			default:
				row[column] = v
			}
		}
		result = append(result, row)
	}
	return result, rows.Err()
}
