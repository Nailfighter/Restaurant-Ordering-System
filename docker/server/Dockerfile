FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY Server/package*.json ./

# Install dependencies using clean install
RUN npm ci --omit=dev

# Copy application source
COPY Server/ .

EXPOSE 3000

CMD ["node", "App.js"]
