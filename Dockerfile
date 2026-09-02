FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src

RUN npm run build:web


FROM nginxinc/nginx-unprivileged:alpine AS runtime

COPY --chown=nginx:nginx docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist/web /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
