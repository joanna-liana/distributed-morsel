### BUILD ###
FROM node:18.12.0-bullseye-slim AS build

WORKDIR /usr/src/app
COPY . .

RUN yarn install --frozen-lockfile \
&& yarn build \
&& yarn cache clean --force

### PRODUCTION ###
FROM node:18.12.0-bullseye-slim AS production
ENV NODE_ENV=production

# TODO: to be fetched from args
EXPOSE 8888

WORKDIR /usr/src/app
COPY package.json .

COPY --from=build /usr/src/app/dist .

RUN yarn install --frozen-lockfile --production\
&& yarn cache clean --force \
&& apt-get update && apt-get install -y --no-install-recommends dumb-init

USER node

CMD ["dumb-init", "node", "--require", "./instrumentation.js", "./src/server.js"]
