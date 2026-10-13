FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5173 DATA_DIR=/app/.data
COPY --from=build /app/dist ./dist
COPY server ./server
COPY package.json ./package.json
RUN mkdir -p /app/.data && chown -R node:node /app
USER node
EXPOSE 5173
CMD ["node", "server/start.js"]
