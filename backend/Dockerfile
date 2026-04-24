# Stage 1: Build Frontend
FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:20-slim
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY backend/ .

# Copy built frontend from Stage 1
COPY --from=frontend-build /frontend/dist ../frontend/dist

EXPOSE 5000
CMD ["node", "server.js"]
