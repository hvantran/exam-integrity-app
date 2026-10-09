# Stage 1
FROM node:24-alpine as builder
WORKDIR /app
COPY ./build ./build

# Stage 2
FROM nginx:alpine as production
ENV NODE_ENV production
WORKDIR /usr/share/nginx/html/
RUN rm -rf ./*
COPY --from=builder /app/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY ./env.sh .
COPY .env .

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh

EXPOSE 80

# Start Nginx server after generating env-config.js
CMD ["/bin/bash", "-c", "./env.sh && nginx -g \"daemon off;\""]
