# KRETEA-TRENDS

KRETEA-TRENDS is a headless data engine that scrapes, analyzes, and serves design trends via API for the main Kretea frontend.

## Architecture Architecture

The system consists of three main components:

1. **API (`/api`)**: A Java Spring Boot REST API that handles data ingestion, processing, and public serving.
2. **Worker (`/worker`)**: A Node.js & Puppeteer microservice that scrapes visual sources (Awwwards, Mobbin, Behance).
3. **Database (`postgres`)**: A local PostgreSQL database for persistence.

## System Requirements

- Docker and Docker Compose
- Java 17+
- Node.js 20+

## Project Structure

- `/api` - Spring Boot backend configuration, endpoints, entity logic.
- `/worker` - Puppeteer scraper script, scheduled node-cron tasks.
- `docker-compose.yml` - Root orchestration config.
