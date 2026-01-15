# Use a lightweight Node.js image
FROM node:20-alpine


# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps


# Copy the rest of the app
COPY . .

# Set dummy environment variables for build process
ENV MONGODB_URI=mongodb://localhost:27017/dummy
ENV JWT_SECRET=dummy-secret-for-build
ENV GEMINI_API_KEY=dummy-key-for-build
ENV OPENAI_API_KEY=dummy-key-for-build

# Build the Next.js app
RUN npm run build

# Expose port 3000 (Next.js default)
EXPOSE 3000

# Start the app in production mode
CMD ["npm", "start"]