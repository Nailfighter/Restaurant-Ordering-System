# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency files
COPY Kitchen-Display-System/package*.json ./

# Install dependencies using clean install
RUN npm ci

# Copy all source files
COPY Kitchen-Display-System/ .

# Vite inlines VITE_-prefixed vars at build time
ARG VITE_API_URL
ARG VITE_WSS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WSS_URL=$VITE_WSS_URL

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy static assets from build stage to Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration from the docker folder
COPY docker/kitchen-display-system/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
