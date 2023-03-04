# Use the Alpine Linux image as the base image
FROM node:14-alpine

# Update the package repositories and install the package manager
RUN apk update && apk upgrade

# Install any desired packages using the apk package manager
RUN apk add mysql-client

# copy the package.json and package-lock.json into the container
COPY package*.json ./

# install the app dependencies
RUN npm install

# Copy the rest of the app files into the container
COPY . .

RUN cat package.json
RUN cat index.js

# Specify the command to run when the container starts
CMD ["node", "app.js", "method=ENV"]
