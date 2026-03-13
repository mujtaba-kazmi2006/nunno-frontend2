# Build stage
FROM node:18-slim as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Increase memory limit for Vite build to prevent SIGSEGV
# 1024MB is a safer choice for a 2GB VPS than 2048MB
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Vite/React SPA fix: Redirect all paths to index.html
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
