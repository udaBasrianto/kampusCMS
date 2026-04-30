package main

import (
	"context"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/lib/pq"
)

// Hero Slides
func getHeroSlides(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		"SELECT id, title, eyebrow, description, image_url, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, active, sort_order, created_at, updated_at FROM hero_slides WHERE active = true ORDER BY sort_order")
	if err != nil {
		log.Println("getHeroSlides query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch hero slides"})
	}
	defer rows.Close()

	slides := []HeroSlide{}
	for rows.Next() {
		var s HeroSlide
		if err := rows.Scan(&s.ID, &s.Title, &s.Eyebrow, &s.Description, &s.ImageURL, &s.CTA1Label, &s.CTA1Href, &s.CTA2Label, &s.CTA2Href, &s.Active, &s.SortOrder, &s.CreatedAt, &s.UpdatedAt); err != nil {
			log.Println("getHeroSlides scan error:", err)
			continue
		}
		slides = append(slides, s)
	}
	return c.JSON(slides)
}

func createHeroSlide(c *fiber.Ctx) error {
	var slide HeroSlide
	if err := c.BodyParser(&slide); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	err := db.QueryRowContext(context.Background(),
		"INSERT INTO hero_slides (title, eyebrow, description, image_url, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, active, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id, created_at, updated_at",
		slide.Title, slide.Eyebrow, slide.Description, slide.ImageURL, slide.CTA1Label, slide.CTA1Href, slide.CTA2Label, slide.CTA2Href, slide.Active, slide.SortOrder,
	).Scan(&slide.ID, &slide.CreatedAt, &slide.UpdatedAt)

	if err != nil {
		log.Println("createHeroSlide error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create hero slide"})
	}
	return c.Status(http.StatusCreated).JSON(slide)
}

func updateHeroSlide(c *fiber.Ctx) error {
	id := c.Params("id")
	var slide HeroSlide
	if err := c.BodyParser(&slide); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	_, err := db.ExecContext(context.Background(),
		"UPDATE hero_slides SET title=$1, eyebrow=$2, description=$3, image_url=$4, cta_primary_label=$5, cta_primary_href=$6, cta_secondary_label=$7, cta_secondary_href=$8, active=$9, sort_order=$10, updated_at=NOW() WHERE id=$11",
		slide.Title, slide.Eyebrow, slide.Description, slide.ImageURL, slide.CTA1Label, slide.CTA1Href, slide.CTA2Label, slide.CTA2Href, slide.Active, slide.SortOrder, id)

	if err != nil {
		log.Println("updateHeroSlide error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update hero slide"})
	}
	return c.JSON(fiber.Map{"message": "Updated successfully"})
}

func deleteHeroSlide(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := db.ExecContext(context.Background(), "DELETE FROM hero_slides WHERE id=$1", id)
	if err != nil {
		log.Println("deleteHeroSlide error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete hero slide"})
	}
	return c.JSON(fiber.Map{"message": "Deleted successfully"})
}

// Faculties
func getFaculties(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		`SELECT id, code, name, slug, COALESCE(description, ''), COALESCE(vision, ''),
		COALESCE(mission, ''), COALESCE(about_content, ''), COALESCE(hero_title, ''),
		COALESCE(hero_eyebrow, ''), COALESCE(hero_description, ''), COALESCE(cover_image_url, ''),
		COALESCE(accent, 'navy'), active, programs, sort_order, facilities, contact_info,
		created_at, updated_at FROM faculties WHERE active = true ORDER BY sort_order`)
	if err != nil {
		log.Println("getFaculties query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch faculties"})
	}
	defer rows.Close()

	faculties := []Faculty{}
	for rows.Next() {
		var f Faculty
		if err := rows.Scan(&f.ID, &f.Code, &f.Name, &f.Slug, &f.Description, &f.Vision, &f.Mission, &f.AboutContent, &f.HeroTitle, &f.HeroEyebrow, &f.HeroDescription, &f.CoverImageURL, &f.Accent, &f.Active, &f.Programs, &f.SortOrder, &f.Facilities, &f.ContactInfo, &f.CreatedAt, &f.UpdatedAt); err != nil {
			log.Println("getFaculties scan error:", err)
			continue
		}
		faculties = append(faculties, f)
	}
	return c.JSON(faculties)
}

func getFacultyBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	var f Faculty
	err := db.QueryRowContext(context.Background(),
		`SELECT id, code, name, slug, COALESCE(description, ''), COALESCE(vision, ''),
		COALESCE(mission, ''), COALESCE(about_content, ''), COALESCE(hero_title, ''),
		COALESCE(hero_eyebrow, ''), COALESCE(hero_description, ''), COALESCE(cover_image_url, ''),
		COALESCE(accent, 'navy'), active, programs, sort_order, facilities, contact_info,
		created_at, updated_at FROM faculties WHERE slug=$1`,
		slug).Scan(&f.ID, &f.Code, &f.Name, &f.Slug, &f.Description, &f.Vision, &f.Mission, &f.AboutContent, &f.HeroTitle, &f.HeroEyebrow, &f.HeroDescription, &f.CoverImageURL, &f.Accent, &f.Active, &f.Programs, &f.SortOrder, &f.Facilities, &f.ContactInfo, &f.CreatedAt, &f.UpdatedAt)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Faculty not found"})
	}
	return c.JSON(f)
}

// News
func getNews(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		"SELECT id, title, excerpt, content, image_url, category, date, featured, active, created_at, updated_at FROM news WHERE active = true ORDER BY date DESC")
	if err != nil {
		log.Println("getNews query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch news"})
	}
	defer rows.Close()

	news := []News{}
	for rows.Next() {
		var n News
		if err := rows.Scan(&n.ID, &n.Title, &n.Excerpt, &n.Content, &n.ImageURL, &n.Category, &n.Date, &n.Featured, &n.Active, &n.CreatedAt, &n.UpdatedAt); err != nil {
			log.Println("getNews scan error:", err)
			continue
		}
		news = append(news, n)
	}
	return c.JSON(news)
}

func getNewsByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var n News
	err := db.QueryRowContext(context.Background(),
		"SELECT id, title, excerpt, content, image_url, category, date, featured, active, created_at, updated_at FROM news WHERE id=$1",
		id).Scan(&n.ID, &n.Title, &n.Excerpt, &n.Content, &n.ImageURL, &n.Category, &n.Date, &n.Featured, &n.Active, &n.CreatedAt, &n.UpdatedAt)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "News not found"})
	}
	return c.JSON(n)
}

// Testimonials
func getTestimonials(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		"SELECT id, name, role, quote, image_url, year, active, sort_order, created_at, updated_at FROM testimonials WHERE active = true ORDER BY sort_order")
	if err != nil {
		log.Println("getTestimonials query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch testimonials"})
	}
	defer rows.Close()

	testimonials := []Testimonial{}
	for rows.Next() {
		var t Testimonial
		if err := rows.Scan(&t.ID, &t.Name, &t.Role, &t.Quote, &t.ImageURL, &t.Year, &t.Active, &t.SortOrder, &t.CreatedAt, &t.UpdatedAt); err != nil {
			log.Println("getTestimonials scan error:", err)
			continue
		}
		testimonials = append(testimonials, t)
	}
	return c.JSON(testimonials)
}

// Blog Posts
func getBlogPosts(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		"SELECT id, title, slug, excerpt, content, cover_image_url, author_name, category, tags, faculty_id, status, published_at, seo_title, seo_description, views, created_at, updated_at FROM blog_posts WHERE status='published' ORDER BY published_at DESC")
	if err != nil {
		log.Println("getBlogPosts query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch blog posts"})
	}
	defer rows.Close()

	posts := []BlogPost{}
	for rows.Next() {
		var p BlogPost
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Excerpt, &p.Content, &p.CoverImageURL, &p.AuthorName, &p.Category, pq.Array(&p.Tags), &p.FacultyID, &p.Status, &p.PublishedAt, &p.SeoTitle, &p.SeoDescription, &p.Views, &p.CreatedAt, &p.UpdatedAt); err != nil {
			log.Println("getBlogPosts scan error:", err)
			continue
		}
		posts = append(posts, p)
	}
	return c.JSON(posts)
}

func getBlogPostBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	ip := c.IP()

	// Track view by IP
	_, _ = db.ExecContext(context.Background(), `
		WITH new_view AS (
			INSERT INTO blog_post_views (blog_post_id, ip_address)
			SELECT id, $1 FROM blog_posts WHERE slug=$2
			ON CONFLICT (blog_post_id, ip_address) DO NOTHING
			RETURNING blog_post_id
		)
		UPDATE blog_posts SET views = views + 1
		WHERE id IN (SELECT blog_post_id FROM new_view)
	`, ip, slug)

	var p BlogPost
	err := db.QueryRowContext(context.Background(),
		"SELECT id, title, slug, excerpt, content, cover_image_url, author_name, category, tags, faculty_id, status, published_at, seo_title, seo_description, views, created_at, updated_at FROM blog_posts WHERE slug=$1",
		slug).Scan(&p.ID, &p.Title, &p.Slug, &p.Excerpt, &p.Content, &p.CoverImageURL, &p.AuthorName, &p.Category, pq.Array(&p.Tags), &p.FacultyID, &p.Status, &p.PublishedAt, &p.SeoTitle, &p.SeoDescription, &p.Views, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Blog post not found"})
	}
	return c.JSON(p)
}

// Pages
func getPageBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	var p Page
	err := db.QueryRowContext(context.Background(),
		"SELECT id, title, subtitle, slug, content, cover_image_url, published, sort_order, seo_title, seo_description, created_at, updated_at FROM pages WHERE slug=$1 AND published=true",
		slug).Scan(&p.ID, &p.Title, &p.Subtitle, &p.Slug, &p.Content, &p.CoverImageURL, &p.Published, &p.SortOrder, &p.SeoTitle, &p.SeoDescription, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Page not found"})
	}
	return c.JSON(p)
}

// Contact
func submitContact(c *fiber.Ctx) error {
	var msg ContactMessage
	if err := c.BodyParser(&msg); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	_, err := db.ExecContext(context.Background(),
		"INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)",
		msg.Name, msg.Email, msg.Phone, msg.Subject, msg.Message)

	if err != nil {
		log.Println("submitContact error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to send message"})
	}
	return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "Message sent successfully"})
}

// Admin: Get Messages
func getMessages(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		"SELECT id, name, email, phone, subject, message, is_read, created_at FROM contact_messages ORDER BY created_at DESC")
	if err != nil {
		log.Println("getMessages query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch messages"})
	}
	defer rows.Close()

	messages := []ContactMessage{}
	for rows.Next() {
		var m ContactMessage
		if err := rows.Scan(&m.ID, &m.Name, &m.Email, &m.Phone, &m.Subject, &m.Message, &m.IsRead, &m.CreatedAt); err != nil {
			log.Println("getMessages scan error:", err)
			continue
		}
		messages = append(messages, m)
	}
	return c.JSON(messages)
}

func markMessageRead(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		IsRead *bool `json:"is_read"`
	}
	if err := c.BodyParser(&req); err != nil {
		log.Println("markMessageRead parse error:", err)
	}
	isRead := true
	if req.IsRead != nil {
		isRead = *req.IsRead
	}
	_, err := db.ExecContext(context.Background(), "UPDATE contact_messages SET is_read=$1 WHERE id=$2", isRead, id)
	if err != nil {
		log.Println("markMessageRead error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update message"})
	}
	return c.JSON(fiber.Map{"message": "Message marked as read"})
}

func getPages(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		"SELECT id, title, subtitle, slug, content, cover_image_url, published, sort_order, seo_title, seo_description, created_at, updated_at FROM pages ORDER BY sort_order, title")
	if err != nil {
		log.Println("getPages query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch pages"})
	}
	defer rows.Close()

	pages := []Page{}
	for rows.Next() {
		var p Page
		if err := rows.Scan(&p.ID, &p.Title, &p.Subtitle, &p.Slug, &p.Content, &p.CoverImageURL, &p.Published, &p.SortOrder, &p.SeoTitle, &p.SeoDescription, &p.CreatedAt, &p.UpdatedAt); err != nil {
			log.Println("getPages scan error:", err)
			continue
		}
		pages = append(pages, p)
	}
	return c.JSON(pages)
}

func getPrograms(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		"SELECT id, faculty_id, name, level, description, accreditation, duration_years, active, sort_order, created_at, updated_at FROM faculty_programs ORDER BY sort_order, name")
	if err != nil {
		log.Println("getPrograms query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch programs"})
	}
	defer rows.Close()

	programs := []Program{}
	for rows.Next() {
		var p Program
		if err := rows.Scan(&p.ID, &p.FacultyID, &p.Name, &p.Level, &p.Description, &p.Accreditation, &p.DurationYears, &p.Active, &p.SortOrder, &p.CreatedAt, &p.UpdatedAt); err != nil {
			log.Println("getPrograms scan error:", err)
			continue
		}
		programs = append(programs, p)
	}
	return c.JSON(programs)
}

func getLecturers(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		"SELECT id, faculty_id, name, position, education, expertise, photo_url, active, sort_order, created_at, updated_at FROM faculty_lecturers ORDER BY sort_order, name")
	if err != nil {
		log.Println("getLecturers query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch lecturers"})
	}
	defer rows.Close()

	lecturers := []Lecturer{}
	for rows.Next() {
		var l Lecturer
		if err := rows.Scan(&l.ID, &l.FacultyID, &l.Name, &l.Position, &l.Education, &l.Expertise, &l.PhotoURL, &l.Active, &l.SortOrder, &l.CreatedAt, &l.UpdatedAt); err != nil {
			log.Println("getLecturers scan error:", err)
			continue
		}
		lecturers = append(lecturers, l)
	}
	return c.JSON(lecturers)
}

// Settings
func getSettings(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(), "SELECT key, value, updated_at FROM site_settings")
	if err != nil {
		log.Println("getSettings query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch settings"})
	}
	defer rows.Close()

	settings := []SiteSetting{}
	for rows.Next() {
		var s SiteSetting
		if err := rows.Scan(&s.Key, &s.Value, &s.UpdatedAt); err != nil {
			log.Println("getSettings scan error:", err)
			continue
		}
		settings = append(settings, s)
	}
	return c.JSON(settings)
}

func getDashboardStats(c *fiber.Ctx) error {
	var faculties, news, blogPosts, unreadMessages int64

	db.QueryRowContext(context.Background(), "SELECT COUNT(*) FROM faculties WHERE active=true").Scan(&faculties)
	db.QueryRowContext(context.Background(), "SELECT COUNT(*) FROM news WHERE active=true").Scan(&news)
	db.QueryRowContext(context.Background(), "SELECT COUNT(*) FROM blog_posts WHERE status='published'").Scan(&blogPosts)
	db.QueryRowContext(context.Background(), "SELECT COUNT(*) FROM contact_messages WHERE is_read=false").Scan(&unreadMessages)

	return c.JSON(fiber.Map{
		"faculties":       faculties,
		"news":            news,
		"blog_posts":      blogPosts,
		"unread_messages": unreadMessages,
	})
}

// Campus Events (public)
func getEvents(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		`SELECT id, title, COALESCE(description,''), COALESCE(image_url,''), event_date,
		 COALESCE(start_time::text,'00:00'), COALESCE(end_time::text,'23:59'),
		 COALESCE(location,''), COALESCE(map_coordinates,''), active, sort_order, created_at, updated_at
		 FROM campus_events WHERE active = true ORDER BY event_date ASC, sort_order`)
	if err != nil {
		log.Println("getEvents query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch events"})
	}
	defer rows.Close()

	events := []map[string]interface{}{}
	for rows.Next() {
		var id, title, desc, imageURL, eventDate, startTime, endTime, location, mapCoords, createdAt, updatedAt string
		var active bool
		var sortOrder int
		if err := rows.Scan(&id, &title, &desc, &imageURL, &eventDate, &startTime, &endTime, &location, &mapCoords, &active, &sortOrder, &createdAt, &updatedAt); err != nil {
			log.Println("getEvents scan error:", err)
			continue
		}
		events = append(events, map[string]interface{}{
			"id": id, "title": title, "description": desc, "image_url": imageURL,
			"event_date": eventDate, "start_time": startTime, "end_time": endTime,
			"location": location, "map_coordinates": mapCoords, "active": active, "sort_order": sortOrder,
			"created_at": createdAt, "updated_at": updatedAt,
		})
	}
	return c.JSON(events)
}

func getEventByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var evID, title, desc, imageURL, eventDate, startTime, endTime, location, mapCoords, createdAt, updatedAt string
	var active bool
	var sortOrder int
	err := db.QueryRowContext(context.Background(),
		`SELECT id, title, COALESCE(description,''), COALESCE(image_url,''), event_date,
		 COALESCE(start_time::text,'00:00'), COALESCE(end_time::text,'23:59'),
		 COALESCE(location,''), COALESCE(map_coordinates,''), active, sort_order, created_at, updated_at
		 FROM campus_events WHERE id=$1`, id,
	).Scan(&evID, &title, &desc, &imageURL, &eventDate, &startTime, &endTime, &location, &mapCoords, &active, &sortOrder, &createdAt, &updatedAt)

	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Event not found"})
	}

	return c.JSON(fiber.Map{
		"id": evID, "title": title, "description": desc, "image_url": imageURL,
		"event_date": eventDate, "start_time": startTime, "end_time": endTime,
		"location": location, "map_coordinates": mapCoords, "active": active, "sort_order": sortOrder,
		"created_at": createdAt, "updated_at": updatedAt,
	})
}

// Placeholder handlers for remaining routes
func createNews(c *fiber.Ctx) error        { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func updateNews(c *fiber.Ctx) error        { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func deleteNews(c *fiber.Ctx) error        { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func createTestimonial(c *fiber.Ctx) error { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func updateTestimonial(c *fiber.Ctx) error { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func deleteTestimonial(c *fiber.Ctx) error { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func createBlogPost(c *fiber.Ctx) error    { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func updateBlogPost(c *fiber.Ctx) error    { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func deleteBlogPost(c *fiber.Ctx) error    { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func createPage(c *fiber.Ctx) error        { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func updatePage(c *fiber.Ctx) error        { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func deletePage(c *fiber.Ctx) error        { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func deleteMessage(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := db.ExecContext(context.Background(), "DELETE FROM contact_messages WHERE id=$1", id)
	if err != nil {
		log.Println("deleteMessage error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete message"})
	}
	return c.JSON(fiber.Map{"message": "Deleted successfully"})
}

func updateSettings(c *fiber.Ctx) error {
	var req SiteSetting
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	value, err := normalizeValue("value", req.Value)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	_, err = db.ExecContext(context.Background(),
		"INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=NOW()",
		req.Key, value)
	if err != nil {
		log.Println("updateSettings error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update settings"})
	}
	return c.JSON(fiber.Map{"message": "Settings updated"})
}

func getUsers(c *fiber.Ctx) error {
	rows, err := db.QueryContext(context.Background(),
		`SELECT u.id, u.email, COALESCE(u.full_name, ''), u.role, COALESCE(u.status, 'active'), u.created_at,
			COALESCE(array_agg(fa.faculty_id) FILTER (WHERE fa.faculty_id IS NOT NULL), '{}') AS faculty_ids
		FROM users u
		LEFT JOIN faculty_admins fa ON fa.user_id = u.id
		GROUP BY u.id
		ORDER BY u.created_at DESC`)
	if err != nil {
		log.Println("getUsers query error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch users"})
	}
	defer rows.Close()

	users := []User{}
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.Status, &u.CreatedAt, pq.Array(&u.FacultyIDs)); err != nil {
			log.Println("getUsers scan error:", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process user data"})
		}
		users = append(users, u)
	}
	return c.JSON(users)
}

func createUser(c *fiber.Ctx) error {
	var req struct {
		Email      string   `json:"email"`
		Password   string   `json:"password"`
		FullName   string   `json:"full_name"`
		Role       string   `json:"role"`
		FacultyIDs []string `json:"faculty_ids"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if req.Role == "" {
		req.Role = "admin"
	}
	if req.Password == "" {
		req.Password = "admin123"
	}

	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		log.Println("createUser hash error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	var id string
	err = db.QueryRowContext(context.Background(),
		`INSERT INTO users (email, password_hash, full_name, role)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET role=$4, full_name=COALESCE(NULLIF($3, ''), users.full_name), updated_at=NOW()
		RETURNING id`,
		req.Email, hashedPassword, req.FullName, req.Role).Scan(&id)
	if err != nil {
		log.Println("createUser error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user: " + err.Error()})
	}

	if req.Role == "faculty_admin" {
		if _, err := db.ExecContext(context.Background(), "DELETE FROM faculty_admins WHERE user_id=$1", id); err != nil {
			log.Println("createUser faculty_admins cleanup error:", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to assign faculty"})
		}
		for _, facultyID := range req.FacultyIDs {
			if _, err := db.ExecContext(context.Background(), "INSERT INTO faculty_admins (user_id, faculty_id) VALUES ($1, $2)", id, facultyID); err != nil {
				log.Println("createUser faculty_admins insert error:", err)
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to assign faculty"})
			}
		}
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{"id": id})
}

func updateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var req struct {
		FacultyIDs []string `json:"faculty_ids"`
		Status     string   `json:"status"`
		FullName   string   `json:"full_name"`
		Email      string   `json:"email"`
		Password   string   `json:"password"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	
	if req.Status != "" {
		if _, err := db.ExecContext(context.Background(), "UPDATE users SET status=$1 WHERE id=$2", req.Status, id); err != nil {
			log.Println("updateUser status error:", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user status"})
		}
	}

	if req.FullName != "" || req.Email != "" || req.Password != "" {
		// Build dynamic query
		query := "UPDATE users SET updated_at=NOW()"
		var args []interface{}
		argId := 1

		if req.FullName != "" {
			query += fmt.Sprintf(", full_name=$%d", argId)
			args = append(args, req.FullName)
			argId++
		}
		if req.Email != "" {
			query += fmt.Sprintf(", email=$%d", argId)
			args = append(args, req.Email)
			argId++
		}
		if req.Password != "" {
			hashedPw, err := hashPassword(req.Password)
			if err != nil {
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
			}
			query += fmt.Sprintf(", password_hash=$%d", argId)
			args = append(args, hashedPw)
			argId++
		}

		query += fmt.Sprintf(" WHERE id=$%d", argId)
		args = append(args, id)

		if _, err := db.ExecContext(context.Background(), query, args...); err != nil {
			log.Println("updateUser basic details error:", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user details: " + err.Error()})
		}
	}
	
	if req.FacultyIDs != nil {
		if _, err := db.ExecContext(context.Background(), "DELETE FROM faculty_admins WHERE user_id=$1", id); err != nil {
			log.Println("updateUser faculty cleanup error:", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user"})
		}
		for _, facultyID := range req.FacultyIDs {
			if _, err := db.ExecContext(context.Background(), "INSERT INTO faculty_admins (user_id, faculty_id) VALUES ($1, $2)", id, facultyID); err != nil {
				log.Println("updateUser faculty insert error:", err)
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update user faculty"})
			}
		}
	}
	return c.JSON(fiber.Map{"message": "User updated"})
}

func deleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	_, err := db.ExecContext(context.Background(), "DELETE FROM users WHERE id=$1", id)
	if err != nil {
		log.Println("deleteUser error:", err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete user"})
	}
	return c.JSON(fiber.Map{"message": "User deleted"})
}

func createFaculty(c *fiber.Ctx) error { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func updateFaculty(c *fiber.Ctx) error { return c.JSON(fiber.Map{"message": "Not implemented"}) }
func deleteFaculty(c *fiber.Ctx) error { return c.JSON(fiber.Map{"message": "Not implemented"}) }
