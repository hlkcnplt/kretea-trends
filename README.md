# kretea-trends

A headless data engine that scrapes, analyzes, and serves design trends. Powers the trends feed at `https://trends.kretea.com`.

## How it works

Three services work together:

| Service | Stack | Role |
|---|---|---|
| `api` | Java 17, Spring Boot 3 | Ingests, stores, and serves trend data via REST |
| `worker` | Node.js 20, Puppeteer | Scrapes Awwwards, Mobbin, and Behance on a 24h schedule |
| `postgres` | PostgreSQL 15 | Persistent storage |

The worker scrapes visual sources, runs each image through a local LLM (via an OpenAI-compatible endpoint like LM Studio or Ollama) to extract style tags and dominant colors, then POSTs results to the API.

## API Endpoints

```
POST /v1/trends/ingest     — Worker → API. Requires X-KRETEA-AUTH header.
GET  /v1/trends            — Paginated trend list. Supports ?page=&size=
GET  /v1/trends/search     — Filter by tag. Requires ?tag=
```

## Running locally

**Prerequisites:** Docker, Docker Compose

```bash
# Copy and fill in secrets
cp worker/.env.example worker/.env

# Start everything
docker compose up --build
```

The API will be available at `http://localhost:8080`.

### Worker only (no Docker)

```bash
cd worker
cp .env.example .env   # edit as needed
npm install
npm run dev
```

The worker requires a running local LLM server (e.g. LM Studio at `http://127.0.0.1:1234`) and the Spring Boot API.

## Environment variables

### Worker (`worker/.env`)

| Variable | Description | Default |
|---|---|---|
| `API_URL` | Full ingest endpoint URL | — |
| `KRETEA_AUTH_SECRET` | Shared secret for the API | — |
| `SCHEDULE_INTERVAL_MS` | Scrape interval in ms | `86400000` (24h) |
| `AI_MODEL_URL` | Base URL of the LLM server | `http://127.0.0.1:1234` |
| `AI_MODEL_NAME` | Model identifier | — |
| `AI_API_KEY` | API key (`no-key` for local) | `no-key` |

### API (environment or Render dashboard)

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `KRETEA_AUTH_SECRET` | Shared secret (must match worker) |
| `SPRING_PROFILES_ACTIVE` | `local` or `prod` |

## Security

- The `/ingest` endpoint is protected by a `X-KRETEA-AUTH` header check. Requests without the correct secret get a 401.
- GET endpoints are rate-limited per IP (100 req/min by default).
- CORS is locked to `https://trends.kretea.com` in production, `http://localhost:3000` in local profile.

## Project structure

```
kretea-trends/
├── api/                  Spring Boot REST API
│   ├── src/main/java/com/kretea/trends/
│   │   ├── controller/   TrendController.java
│   │   ├── model/        Trend.java
│   │   ├── dto/          TrendIngestRequest.java
│   │   ├── repository/   TrendRepository.java
│   │   ├── security/     SecurityFilter.java, RateLimitFilter.java
│   │   ├── config/       WebConfig.java
│   │   └── exception/    GlobalExceptionHandler.java
│   └── src/main/resources/
│       ├── application.yml
│       ├── application-local.yml
│       └── application-prod.yml
├── worker/               Node.js scraper
│   └── src/
│       ├── scrapers/     awwwards.js, mobbin.js, behance.js
│       ├── services/     api.js, intelligence.js
│       └── config/       index.js
└── docker-compose.yml
```
