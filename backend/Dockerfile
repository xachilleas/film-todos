# Use Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (including dev dependencies for TypeScript build)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]