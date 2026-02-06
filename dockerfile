FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY . .

RUN chown -R node:node /usr/src/app

USER node

CMD [ "node", "index.js" ]