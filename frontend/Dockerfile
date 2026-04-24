# Build stage
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build artifacts to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed, but default is fine for simple SPA
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
