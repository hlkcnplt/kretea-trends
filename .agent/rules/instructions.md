---
trigger: always_on
---

# Backend Instructions: KRETEA-TRENDS Service

## System Architecture

- **Purpose:** A headless data engine that scrapes, analyzes, and serves design trends via API.
- **Backend:** Java Spring Boot (REST API).
- **Worker:** Node.js + Puppeteer (Scraping Service).
- **Intelligence:** AI integration for automated tagging and color extraction.
- **Database:** PostgreSQL for persistent trend data.

## 1. Scraper Specifications (Node.js)

- **Target Sources:** Awwwards (Web), Mobbin (Mobile), Behance (Visuals).
- **Execution:** Headless browser crawls. Extract image blobs/URLs and CSS metadata.
- **Payload:** Send raw data to the Spring Boot `/ingest` endpoint.

## 2. Intelligence Layer (AI Processing)

- **Automated Tagging:** Pass metadata to AI to identify design systems (e.g., "Bento", "Neo-brutalism").
- **Color Analysis:** Extract dominant HEX codes from images.
- **Summarization:** Generate a 1-sentence technical "Design Note" for each trend.

## 3. Spring Boot API Requirements

- **Endpoint Structure:**
  - `POST /v1/trends/ingest`: Receives data from the scraper.
  - `GET /v1/trends`: Returns paginated trend objects for the main Kretea frontend.
  - `GET /v1/trends/search?tag=...`: Filter trends by style or color.
- **Data Model:**
  - `TrendID`, `SourceURL`, `ImageURL`, `StyleTags[]`, `PrimaryColors[]`, `CreatedAt`.

## 4. Operational Rules

- **Automation:** Schedule scrapers to run every 24 hours.
- **Deduplication:** Check `SourceURL` before saving to prevent duplicate entries.
- **Performance:** All images should be served via a CDN or optimized proxy to ensure the Kretea frontend remains fast.

## 5. Coding Style

- Use **Lombok** in Java for clean models.
- Implement **Global Exception Handling** for API stability.
- Use **Environment Variables** for all AI keys and DB credentials.

## 6. Production Security & Access Control

- **CORS Policy:** Strictly allow only `https://trends.kretea.com`. Reject all other origins.
- **Request Validation:** Implement a custom `SecurityFilter` to check for a `X-KRETEA-AUTH` secret key in headers.
- **Environment Awareness:** - In **DEV**: Allow `localhost:3000`.
  - In **PROD**: Enforce strict Origin and Header checks.
- **Rate Limiting:** Limit requests per IP to prevent scraping of your own trend engine.
