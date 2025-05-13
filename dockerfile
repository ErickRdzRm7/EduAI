# Usa una imagen base de Node.js (elige la versión adecuada)
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero para aprovechar el caché de Docker
COPY package*.json ./

# Instala las dependencias de producción
RUN npm install 

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que correrá tu API (debe coincidir con API_PORT en .env si tu app lo usa)
EXPOSE 8000

# El comando para iniciar tu API en modo producción (ajusta según tu script)
# Asegúrate que tu script de inicio lea el puerto de la variable de entorno PORT si es necesario
CMD [ "npm", "start" ]