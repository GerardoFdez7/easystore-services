# Usar una imagen de Node.js ligera como base
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias package.json y package-lock.json al contenedor
COPY package*.json ./

# Ejecutar la instalación de dependencias en el contenedor
RUN npm install

# Exponer el puerto 3000 para que la aplicación pueda ser accesible desde fuera del contenedor
EXPOSE 3000

# Definir el comando por defecto para iniciar la aplicación en modo desarrollo
CMD ["npm", "run", "start:dev"]
