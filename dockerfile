FROM oven/bun:1-alpine

WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY . .

USER bun

CMD [ "bun", "run", "index.js" ]