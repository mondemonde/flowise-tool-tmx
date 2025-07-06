# Use official Node.js LTS image
FROM node:20-slim

# Install Playwright dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Install Playwright (browsers will be installed via postinstall)
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npx playwright install --with-deps

# Copy rest of the app
COPY . .

# Build the NestJS app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "start:prod"]
