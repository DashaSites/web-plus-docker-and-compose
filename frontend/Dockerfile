FROM node:16-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm сi -no-audit --no-fund

COPY . ./

RUN npm run build

# Следующий слой
FROM nginx:alpine AS runner

WORKDIR /app

COPY --from=builder /app/build /usr/share/nginx/html

# COPY ./nginx/default.conf /etc/nginx/conf.d

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]