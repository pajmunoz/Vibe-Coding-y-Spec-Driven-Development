# Imagen base: Nginx Alpine (ligera)
FROM nginx:1.27-alpine

# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/cotizador-front.conf

# Copia los archivos estáticos del frontend
COPY index.html /usr/share/nginx/html/
COPY css/       /usr/share/nginx/html/css/
COPY js/        /usr/share/nginx/html/js/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
