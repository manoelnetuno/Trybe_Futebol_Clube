# Use the official Node.js 16.14 image with Alpine Linux as the base image
FROM node:16.14-alpine

# Set the working directory to /app-backend
WORKDIR /app-backend

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Expose port 3001 for the application
EXPOSE 3001

# Set the command to start the application with good practices
ENTRYPOINT ["npm", "run"]

CMD [ "start" ]