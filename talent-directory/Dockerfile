FROM node:20-alpine as builder 

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# stage2

FROM node:slim
WORKDIR /app
COPY --from=builder /app .
EXPOSE 5000

CMD ["npm", "start"]
