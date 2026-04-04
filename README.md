# dev-forum

A channel-based Q&A forum for programmers. Ask questions, share knowledge, and learn together.

## Tech Stack

- **Frontend/Backend:** Next.js 16 (App Router)
- **Database:** PostgreSQL 16
- **Containerization:** Docker + Docker Compose
- **Styling:** Tailwind CSS
- **Auth:** iron-session + bcryptjs

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

## Seed Data

The database comes pre-loaded with:
- 3 channels (javascript, python, general)
- 3 posts with realistic questions
- 2 replies
- 1 admin user

## Database Setup

Schema and seed data are applied automatically on startup via `docker-entrypoint.sh`.

## Running Locally (Without Docker)

### Requirements
- Node.js 20+
- Docker Desktop (for the database)

### 1. Install dependencies
npm install

### 2. Start the database
docker-compose up -d db

### 3. Create your environment file
cp .env.example .env.local

### 4. Run migrations and seed data
docker exec -i devforum-db psql -U postgres -d devforum < src/db/schema.sql
docker exec -i devforum-db psql -U postgres -d devforum < src/db/seed.sql

### 5. Start the development server
npm run dev

### 6. Open the app
Visit http://localhost:3000

## Project Structure
src/
  app/
    api/           # Backend API endpoints
      auth/        # signup, signin, signout, me
      channels/    # channels and posts
      votes/       # voting
      search/      # search
      upload/      # file uploads
      admin/       # admin actions
    admin/         # admin dashboard UI
    auth/          # signin/signup UI
    channels/      # channel and post UI
    components/    # shared components (VoteButton)
    search/        # search UI
  db/              # SQL schema and seed files
  lib/             # database connection and session config
public/
  uploads/         # uploaded screenshots

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/channels | Get all channels | No |
| POST | /api/channels | Create a channel | Yes |
| GET | /api/channels/:id/posts | Get posts in a channel | No |
| POST | /api/channels/:id/posts | Create a post | Yes |
| POST | /api/channels/:id/posts/:postId/replies | Create a reply | Yes |
| POST | /api/votes | Vote on post or reply | Yes |
| GET | /api/votes | Get vote score | No |
| GET | /api/search | Search content | No |
| POST | /api/upload | Upload a screenshot | Yes |
| POST | /api/auth/signup | Create account | No |
| POST | /api/auth/signin | Sign in | No |
| POST | /api/auth/signout | Sign out | Yes |
| GET | /api/auth/me | Get current user | No |
| GET | /api/admin/users | Get all users | Admin |
| DELETE | /api/admin/users | Delete a user | Admin |
| DELETE | /api/admin/channels | Delete a channel | Admin |
| DELETE | /api/admin/posts | Delete a post | Admin |
| DELETE | /api/admin/replies | Delete a reply | Admin |

## Demo Video

[Watch the demo] https://drive.google.com/file/d/1b6rev0l43VXHnI5JcwS_EAIblW8iz8CS/view?usp=sharing