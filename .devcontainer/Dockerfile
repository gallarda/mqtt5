FROM node:alpine AS npm
WORKDIR /tmp
RUN npm install --save-dev @types/node njs-types

FROM nginxplus
COPY --from=npm /tmp/node_modules /node_modules/