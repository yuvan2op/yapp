FROM node:20-alpine AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY src ./src

ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/index.js"]


