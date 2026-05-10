FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install \
    --frozen-lockfile \
    --production=true \
    && yarn cache clean

COPY --chown=node:node . .

ENV NODE_ENV=production

USER node

CMD ["node", "index.js"]