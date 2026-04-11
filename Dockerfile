# -------- Build stage --------
    FROM node:20-alpine AS build

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build -- --configuration production
    
    # -------- Nginx stage --------
    FROM nginx:alpine
    
    # Remove default nginx page
    RUN rm -rf /usr/share/nginx/html/*
    
    # Angular SPA routing
    RUN printf "server {\n\
        listen 80;\n\
        server_name localhost;\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        location / {\n\
            try_files \$uri \$uri/ /index.html;\n\
        }\n\
    }\n" > /etc/nginx/conf.d/default.conf
    
    # COPY the **contents** of Angular build folder
    COPY --from=build /app/dist/myapp/browser /usr/share/nginx/html/
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]