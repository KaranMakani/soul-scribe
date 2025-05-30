FROM node:20-alpine

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copy app source
COPY . .

# Make entrypoint script executable
RUN chmod +x ./docker-entrypoint.sh

# Build the application
RUN npm run build

# Expose port
EXPOSE 8080

# Use entrypoint script to check for database and run migrations before starting
ENTRYPOINT ["./docker-entrypoint.sh"]

# Start the application
CMD ["npm", "run", "start"]