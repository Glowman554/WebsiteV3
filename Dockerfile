FROM node:23

WORKDIR /srv
COPY . .

RUN npm install
RUN npm run build

ENV HOST=0.0.0.0
ARG SERVER_KEY_PATH
ARG SERVER_CERT_PATH

ENTRYPOINT [ "node", "dist/server/entry.mjs" ]