FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200
CMD sed -i 's/localhost/spring-boot/g' proxy.conf.json && npm start -- --host 0.0.0.0
