FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build && npm prune --omit=dev && mkdir -p /root/OneMira/sessions /root/OneMira/wiki/people /root/OneMira/wiki/topics

ENV ONEMIRA_VAULT_PATH=/root/OneMira

ENTRYPOINT ["node", "dist/index.js"]
