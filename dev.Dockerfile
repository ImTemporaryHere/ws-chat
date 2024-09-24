FROM node:20-alpine

WORKDIR /app

# Install app dependencies
COPY package*.json tsconfig.json ./


COPY entrypoint.dev.sh ./

# Command to install dependencies if node_modules is empty
ENTRYPOINT ["/app/entrypoint.dev.sh"]

