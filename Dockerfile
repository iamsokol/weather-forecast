FROM node:18-alpine

RUN apk add --no-cache python3 make g++ postgresql-dev

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g nodemon

EXPOSE 3000

CMD ["nodemon", "src/server.js"]