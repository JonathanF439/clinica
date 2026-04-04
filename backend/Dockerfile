FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

RUN npm prune --omit=dev

EXPOSE 5000
CMD ["node", "dist/main.js"]
