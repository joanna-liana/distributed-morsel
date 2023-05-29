### BUILD ###
FROM node:18.12.0-bullseye-slim AS build

WORKDIR /usr/src/app
COPY . .

RUN npm ci \
&& npm run build \
&& npm cache clean --force

### PRODUCTION ###
FROM node:18.12.0-bullseye-slim AS production
ENV NODE_ENV=production

# TODO: to be fetched from args
EXPOSE 3000

WORKDIR /usr/src/app
COPY . .

COPY --from=build /usr/src/app/dist ./dist

RUN npm ci --omit=dev\
&& npm cache clean --force \
&& apt-get update && apt-get install -y --no-install-recommends dumb-init

USER node

CMD ["dumb-init", "node", "--require", "./dist/instrumentation.js", "./dist/src/main.js"]
