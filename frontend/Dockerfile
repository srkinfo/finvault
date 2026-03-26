# Stage 1: Build React app
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (use lockfile for deterministic builds)
COPY package.json ./
RUN npm install
# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Use custom nginx config to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
