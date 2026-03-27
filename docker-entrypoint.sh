#!/bin/sh
echo "Running database migrations..."
psql $DATABASE_URL -f /app/src/db/schema.sql
echo "Running seed data..."
psql $DATABASE_URL -f /app/src/db/seed.sql
echo "Starting app..."
exec node server.js