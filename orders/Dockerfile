### BUILD ###
FROM node:18.12.0-bullseye-slim AS build

ARG APP_PORT=3000

WORKDIR /usr/src/app
COPY . .

RUN npm ci \
&& npm run build \
&& npm cache clean --force

### PRODUCTION ###
FROM node:18.12.0-bullseye-slim AS production
ENV NODE_ENV=production

EXPOSE $APP_PORT

WORKDIR /usr/src/app
COPY . .

COPY --from=build /usr/src/app/dist ./dist

RUN npm ci --omit=dev \
&& npm cache clean --force \
&& apt-cache policy dumb-init \
&& apt-get update && apt-get install -y --no-install-recommends dumb-init=1.2.5-1 \
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*

USER node

CMD ["dumb-init", "node", "--require", "./dist/instrumentation.js", "./dist/src/main.js"]
