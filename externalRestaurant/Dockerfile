# syntax=docker/dockerfile:1

### BUILD ###
FROM golang:1.19.3-alpine AS build

WORKDIR /app

COPY . .

RUN go mod download \
&& CGO_ENABLED=0 GOOS=linux go build -o ./restaurant \
&& adduser -S 1001


### PRODUCTION ###
FROM scratch

WORKDIR /app

EXPOSE 8080

COPY --from=build /app .

USER 1001

ENTRYPOINT ["./restaurant"]
