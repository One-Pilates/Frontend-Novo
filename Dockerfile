# Etapa 1: build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências primeiro (melhora cache)
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o restante do projeto e gera build
COPY . .
RUN npm run build

# Etapa 2: servir arquivos estáticos
FROM nginx:1.27-alpine AS runner

# Limpa conteúdo padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Ajuste aqui se seu build gerar em outra pasta (ex.: build ao invés de dist)
COPY --from=builder /app/dist /usr/share/nginx/html

# Expondo porta padrão HTTP
EXPOSE 80

# Inicia Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]