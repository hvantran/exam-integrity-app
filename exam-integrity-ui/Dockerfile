# Stage 1
FROM node:24-alpine as builder
WORKDIR /app
COPY ./build ./build

# Stage 2
FROM nginx:alpine as production
WORKDIR /usr/share/nginx/html/
RUN rm -rf ./*
COPY --from=builder /app/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
