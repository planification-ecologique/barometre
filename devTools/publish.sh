#!/usr/bin/bash

#Logging to repository
GIT_HOST=gitlab.seenovate.com:5050
# echo $GIT_HOST
docker login $GIT_HOST

#Build image
CONTAINER_REGISTRY=sig/satg/statsatgouv-app
BRANCH_GIT=$(git symbolic-ref --short HEAD)
IMAGE_TAG_NAME=seenovate-appfront-$BRANCH_GIT:0.0.2
IMAGE_NAME=$GIT_HOST"/"$CONTAINER_REGISTRY"/"$IMAGE_TAG_NAME
echo $IMAGE_NAME
docker rmi $IMAGE_NAME

docker build --no-cache --tag $IMAGE_NAME .

# push to git repository
docker push $IMAGE_NAME

