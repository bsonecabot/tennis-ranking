FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Expose Vite port
EXPOSE 5173

# Dev mode with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
