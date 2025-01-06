#!/usr/bin/bash

#Logging to repository
GIT_HOST=registry.gitlab-forge.din.developpement-durable.gouv.fr
# echo $GIT_HOST
docker login $GIT_HOST

#Build image
CONTAINER_REGISTRY=cgdd/sri/ecolab/indicateurs-territoriaux/tableau-de-bord-de-la-planification-ecologique-sgpe/sgpe-app 
BRANCH_GIT=$(git symbolic-ref --short HEAD)
TAG_NUMBER="0.0.2"
IMAGE_TAG_NAME=barometre-sgpe

echo $BRANCH_GIT

if [ "$BRANCH_GIT" != "main" ]
then
    IMAGE_TAG_NAME=$IMAGE_TAG_NAME-$BRANCH_GIT
else
    IMAGE_TAG_NAME=$IMAGE_TAG_NAME-prod
fi

IMAGE_NAME=$GIT_HOST"/"$CONTAINER_REGISTRY"/"$IMAGE_TAG_NAME:$TAG_NUMBER
echo $IMAGE_NAME

docker build --no-cache --tag $IMAGE_NAME .

# push to git repository
docker push $IMAGE_NAME

docker rmi $IMAGE_NAME