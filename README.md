# dev-forum

A channel-based Q&A forum for programmers. Ask questions, share knowledge, and learn together.

## Tech Stack

- **Frontend/Backend:** Next.js 16 (App Router)
- **Database:** PostgreSQL 16
- **Containerization:** Docker + Docker Compose
- **Styling:** Tailwind CSS

## Running the App

### Requirements
- Docker Desktop

### 1. Create your environment file
cp .env.example .env.local

### 2. Start the application
docker-compose up --build

### 3. Open the app
Visit http://localhost:3000

Docker will automatically:
- Start the PostgreSQL database on port 5432
- Run the schema migrations
- Load the seed data
- Start the Next.js app on port 3000

## Ports

| Service | Port |
|---------|------|
| Next.js App | 3000 |
| PostgreSQL | 5432 |

## Admin Credentials

| Field | Value |
|-------|-------|
| Email | admin@devforum.com |
| Password | admin123 |

## Database Setup

Schema and seed data are applied automatically on startup via `docker-entrypoint.sh`.

To run manually:
```
docker exec -i devforum-db psql -U postgres -d devforum < src/db/schema.sql
docker exec -i devforum-db psql -U postgres -d devforum < src/db/seed.sql
```

## Seed Data

The database comes pre-loaded with:
- 3 channels (javascript, python, general)
- 3 posts with realistic questions
- 2 replies

## Project Structure
```
src/
  app/           # Next.js pages and API routes
    api/         # Backend API endpoints
    channels/    # Channel and post UI pages
  db/            # SQL schema and seed files
  lib/           # Database connection
public/
  uploads/       # Uploaded screenshots
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/channels | Get all channels |
| POST | /api/channels | Create a channel |
| GET | /api/channels/:id/posts | Get posts in a channel |
| POST | /api/channels/:id/posts | Create a post |
| POST | /api/channels/:id/posts/:postId/replies | Create a reply |
| POST | /api/upload | Upload a screenshot |