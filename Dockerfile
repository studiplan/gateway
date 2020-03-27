FROM node:12-alpine

WORKDIR /usr/app

COPY src src
COPY package.json package.json
COPY generator.ts generator.ts
COPY .babelrc .babelrc

RUN npm install && npm run generate && npm run build

EXPOSE 80

CMD ["npm", "start"]
