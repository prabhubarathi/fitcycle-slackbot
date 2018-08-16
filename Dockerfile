FROM node:8.11.3
COPY package.json /src/package.json
WORKDIR /src
RUN npm install
COPY index.js /src
CMD ["node", "/src/index.js"]