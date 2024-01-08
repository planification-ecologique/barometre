# Statsatgouv-app front

## Installation

### Variable d'environnement

L'unique variable d'environnement à déclarer avant de constuire l'application est la variable `NODE_ENV`. 

Les valeurs possibles pour cette variables sont :

- development
- preprod
- production

Cela impacte la source des données statiques.

### Construction de l'application sur Docker / Kubernetes (archi Seenovate)

Constuire l'image :

`docker build -t ppg-front-page-liste .`

Créer un conteneur :

` `

### Construction de l'application depuis les fichiers sources

Exécuter la commande suivante pour construire l'application :

`npm run build`

Le contenu du dossier **/dist** contient alors les fichiers à servir.

<!-- docker run --rm -it --network host --name ppg-front-page-liste -e "VUE_APP_API_URL=https://statatgouv-sig-client.seenovate.com/get_statistics" ppg-front-page-liste -->
### Build for qualif environnement
```
npm run build_qualif
```
### Helm
1. Ensure that your are in the correct kluster by commands
    ```
    kubectl config get-contexts
    kubectl config use <<your_cluster_name>>
    ```
    For the qualif environnement the cluster must be admin@k8s-statsatgouv-prod and for production must be admin@k8s-statsatgouv-v2
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
    helm install --dry-run app-front app-front-chart  --values  app-front-chart/values_prod.yaml --namespace app-front-prod
    ```   
    - Qualif environnement:
    ```
    helm install --dry-run app-front app-front-chart  --values  app-front-chart/values_qualif.yaml --namespace app-front-qualif
    ```  
4. Intall get-statistics-chart.
    - Production environnement:
    ```
    helm install app-front app-front-chart  --values  app-front-chart/values_prod.yaml --namespace app-front-prod
    ```   
    - Qualif environnement:
    ```
    helm install app-front app-front-chart  --values  app-front-chart/values_qualif.yaml --namespace app-front-qualif
    ```
5. Verify the installation by : 
    - helm list  --namespace app-front-prod / qualif
    - kubectl get all -n app-front-prod / qualif
