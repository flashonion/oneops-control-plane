FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV DATA_MODE=demo
ENV PORT=4174

EXPOSE 4174

CMD ["npm", "run", "start:api"]
