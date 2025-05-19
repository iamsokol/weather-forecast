FROM node:18-alpine

RUN apk add --no-cache python3 make g++ postgresql-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN ls -la
RUN ls -la src/ || echo "src directory not found"

EXPOSE 3000

CMD ["node", "src/server.js"]