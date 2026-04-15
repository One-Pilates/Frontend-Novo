# Stage de Servidor - Nginx para servir arquivos estáticos
FROM nginx:stable-alpine

# Copiar arquivos de build do host para o container
# Nota: O build (npm run build) deve ocorrer no GitHub Actions antes do docker build
COPY dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx para suportar React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
