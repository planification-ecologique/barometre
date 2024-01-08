#https://dev.to/oneofthedevs/docker-angular-nginx-37e4
#https://v2.vuejs.org/v2/cookbook/dockerize-vuejs-app.html?redirect=true

# Build stage
# FROM node:lts-alpine as build-stage
# WORKDIR /app
# COPY ./app/package*.json ./
# RUN npm install
# COPY ./app .
# RUN npm run build

# Production stage
FROM nginx:latest AS ngi
# Copying compiled code and nginx config to different folder
# NOTE: This path may change according to your project's output folder 

# COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY ./nginx.conf  /etc/nginx/conf.d/default.conf
COPY ./app/dist /usr/share/nginx/html
# Exposing a port, here it means that inside the container 
# the app will be using Port 9080 while running, otherwise change nginx.conf file 

EXPOSE 9080

CMD ["nginx", "-g", "daemon off;"]

# docker build -t front_statsatgouv .
# docker run -it -p 9080:9080 --rm --name front-container front_statsatgouv
