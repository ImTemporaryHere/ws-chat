FROM node:20-alpine

WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Install dependencies into /app/node_modules
RUN npm ci


COPY src/ ./src/
COPY tests/ ./tests/
COPY jest.config.ts ./
COPY tsconfig.json ./

RUN npx tsc
