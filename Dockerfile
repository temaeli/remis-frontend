FROM registry.lands.go.tz/nginx:1.28.2-alpine

COPY nginx.conf /etc/nginx/nginx.conf

# COPY certs/ /etc/ssl

WORKDIR /usr/share/nginx/html

COPY dist/gasco-frontend/browser/ .