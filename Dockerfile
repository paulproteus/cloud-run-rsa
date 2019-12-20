# Use the official super-lightweight Node image.
# https://hub.docker.com/_/node
FROM node:10-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app
COPY private-from-pq.c .

# Add system dependency for building the C code
RUN apk --no-cache add libc-dev openssl-dev gcc
RUN gcc private-from-pq.c -lssl -lcrypto -o /usr/local/bin/private-from-pq

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./
COPY private-from-pq ./

# Install dependencies.
# If you add a package-lock.json speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "npm", "start" ]
