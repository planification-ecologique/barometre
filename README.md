# SGPE-app front

## Installation

### Local

1. Go to ``app`` directory:
   ```
   cd app 
   ```
2. Install dependencies
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
    helm upgrade --install --dry-run app-front app-front-chart  --values  app-front-chart/values_prod_ecolab.yaml --namespace app-front-prod
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
    helm upgrade --install app-front app-front-chart  --values  app-front-chart/values_qualif.yaml --namespace app-front-qualif
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
There is also a Docker and docker compose:
```
docker compose up --build
```

## Surge Deployment

To deploy the application easily using surge:

```
npm run deploy
```

## Staging Environment

The application supports a staging environment for testing data changes without affecting the production environment.

### Accessing Staging
You can access the staging environment at the following URLs:
- `/staging/dashboard` - View the dashboard with staging data
- `/staging/tags` - Use the tag search with staging data

### Test using Staging

The staging environment uses a different Grist document for data. When making changes that might affect data display, test them in the staging environment first. When accessing the staging environment, a red banner will appear at the top of the page with options to:

1. Navigate between staging pages
2. Verify your changes work as expected
3. Exit the staging environment

### Production Data Source

Production data is sourced from:
`https://grist.numerique.gouv.fr/o/ecolabservicesdonnees/api/docs/49SPrgL9jgVv3JgMaVHCc8/download/csv`

A sample data file is also available in the repo : `grist_indicateurs_mai_2025.csv`.
