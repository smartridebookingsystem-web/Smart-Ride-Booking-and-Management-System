FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173 5174 5175

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
