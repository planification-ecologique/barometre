#!/usr/bin/bash

print_help () {
        # Help function
        echo 'Please exec script with arg -p : '${0}' -p -> production'
        echo 'Please exec script with arg -q : '${0}' -q -> qualif'
        exit 0
}

if [ $# -eq 0 ];
then
    print_help
    exit 0
fi

CONTAINER_REGISTRY=gitlab.seenovate.com:5050
USER_NAME=@maria.soto
PASSWORD=REDACTED_GITLAB_PAT
EMAIL=maria.soto@seenovate.com

deploy_production () {
    #1. Create namespace statsatgouv
    NAMESPACE=app-front-prod
    kubectl create namespace $NAMESPACE

    #2. Create secret to pull images
    kubectl create secret docker-registry regcred --docker-server=$CONTAINER_REGISTRY --docker-username=$USER_NAME --docker-password=$PASSWORD --docker-email=$EMAIL -n $NAMESPACE
}

deploy_qualif () {
    NAMESPACE=app-front-qualif
    kubectl create namespace $NAMESPACE    
    kubectl create secret docker-registry regcred --docker-server=$CONTAINER_REGISTRY --docker-username=$USER_NAME --docker-password=$PASSWORD --docker-email=$EMAIL -n $NAMESPACE
}

while getopts "pqh" opt;do
        case "$opt" in
                h | help)
                        print_help
                        exit 0
                        ;;
                p )
                        deploy_production
                        ;;
                q )
                        deploy_qualif
                        ;;
        esac
done
shift $((OPTIND-1))
