FROM oven/bun:1-alpine

WORKDIR /app

RUN apk add --no-cache tzdata
ENV TZ=Asia/Ho_Chi_Minh

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY --chown=bun:bun . .

ENV NODE_ENV=production

USER bun

CMD ["bun", "run", "src/index.ts"]
