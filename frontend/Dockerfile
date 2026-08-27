# Use Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve to serve the built files
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "5173"]