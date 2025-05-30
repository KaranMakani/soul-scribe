#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Checking database connection..."
until PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c '\q'; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing migrations"

# Run database migrations
npm run db:push

# Start the application
echo "Starting the application..."
exec "$@"