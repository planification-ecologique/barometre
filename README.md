# SGPE-app front

## Installation

### Local

1. Go to ``app`` directory:
   ```
   cd app 
   ```
2. Install depensencies
   ```
   npm install 
   ```
3. Run server
   ```
   npm run serve
   ```

### Helm 
1. Ensure that your are in the correct cluster by commands:
    ```
    kubectl config get-contexts
    kubectl config use <<your_cluster_name>>
    ```
2. Create the namespace and the secret to access to image register gitlab. 
    - Production environnement use command :
    ```
    ./devTools/namespace_secret_to_registry.sh -p
    ```
    - Qualif environnement use command :
    ```
    ./devTools/namespace_secret_to_registry.sh -q
    ```
3. Inspect the values for production or qualif in app-front-chart.
    - Production environnement:
    ```
    helm install --dry-run app-front app-front-chart  --values  app-front-chart/values_prod_ecolab.yaml --namespace app-front-prod
    ```   
    - Qualif environnement:
    ```
    helm install --dry-run app-front app-front-chart  --values  app-front-chart/values_qualif.yaml --namespace app-front-qualif
    ```
4. Intall app-front-chart.
    - Production environnement:
    ```
    helm upgrade --install app-front app-front-chart  --values  app-front-chart/values_prod_ecolab.yaml --namespace app-front-prod
    ```   
    - Qualif environnement:
    ```
    helm install app-front app-front-chart  --values  app-front-chart/values_qualif.yaml --namespace app-front-qualif
    ```
5. Verify the installation by : 
    - helm list  --namespace app-front-prod / qualif
    - kubectl get all -n app-front-prod / qualif

## Build distribution

To create distribution used to create docker images use commands:

1. Production:
   ```
    npm run build
   ```
2. Qualification:
   ```
    npm run build_qualif
   ```
## Docker
There is also un Docker and docker compose:
```
docker compose up --build
```