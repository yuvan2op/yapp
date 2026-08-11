FROM node:20-alpine

WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm i --only=production

# Copy source code
COPY . .

EXPOSE 5000

# Run backend using PM2
CMD ["pm2-runtime", "ecosystem.config.cjs"]