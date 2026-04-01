FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts
RUN npm install typescript --no-save

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN ./node_modules/.bin/tsc

RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
