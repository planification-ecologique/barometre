# Baromètre de la planification écologique

Application web de visualisation des indicateurs du [baromètre de la planification écologique](https://barometre.planification-ecologique.gouv.fr) — tableau de bord interactif basé sur le [Système de design de l'État (DSFR)](https://www.systeme-de-design.gouv.fr/).

## Stack

- **Vue 2** + Vue Router + Vuex
- **Chart.js** pour les graphiques
- **DSFR** (@gouvfr/dsfr)
- Données : exports CSV [Grist](https://www.getgrist.com/) + API [Écolab](https://api.indicateurs.ecologie.gouv.fr/)

## Prérequis

- Node.js 21+
- npm

## Installation locale

```bash
cd app
npm install
cp .env.example .env
# Éditer .env si besoin (token Écolab pour les données régionales)
npm run serve
```

L'application est disponible sur [http://localhost:8080](http://localhost:8080).

### Variables d'environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `VUE_APP_ENV` | `dev`, `qualif` ou `prod` | Oui |
| `VUE_APP_PREFIX_PATH` | Préfixe URL (ex. `/sgpe-app/` pour GitHub Pages) | Non (défaut : `/`) |
| `VUE_APP_TRACKING` | Domaine analytics Eulerian | Non |
| `VUE_APP_ECOLAB_API_TOKEN` | Token Bearer API Écolab (données régionales) | Recommandé |

Voir `app/.env.example` pour le modèle complet.

> **Note :** le token Écolab est injecté au build et visible dans le bundle client. Utiliser un token à droits limités.

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run serve` | Serveur de développement |
| `npm run build` | Build production |
| `npm run build_qualif` | Build environnement qualif |
| `npm run build:pages` | Build GitHub Pages (inclut fallback SPA `404.html`) |
| `npm run download-grist-csvs` | Télécharge les CSV Grist en backup local |
| `npm run test:unit` | Tests unitaires Jest |

## Déploiement GitHub Pages

### 1. Préparer le dépôt

Avant le premier push public, lire **[docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md)** — un token GitLab est présent dans l'historique Git et doit être révoqué + historique purgé.

### 2. Configurer GitHub

1. Créer le dépôt sur GitHub.
2. **Settings → Pages → Build and deployment** : source = **Deploy from a branch**, branche **`gh-pages`**, dossier **`/ (root)`**.
3. *(Optionnel)* **Settings → Secrets and variables → Actions** :
   - Secret `VUE_APP_ECOLAB_API_TOKEN` — token API Écolab pour le build CI.
   - Variable `VUE_APP_TRACKING` — domaine analytics si nécessaire.

### 3. Déployer

| Workflow | Déclencheur | URL |
|----------|-------------|-----|
| [`deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) | push `main` / `master` | `https://<organisation>.github.io/<nom-du-repo>/` |
| [`preview-github-pages.yml`](.github/workflows/preview-github-pages.yml) | ouverture / mise à jour d'une PR | `https://<organisation>.github.io/<nom-du-repo>/pr/<numéro>/` |
| [`cleanup-preview-github-pages.yml`](.github/workflows/cleanup-preview-github-pages.yml) | fermeture d'une PR | supprime le dossier `pr/<numéro>/` |

Chaque PR reçoit un commentaire automatique avec le lien de prévisualisation.

### Déploiement manuel

```bash
cd app
VUE_APP_PREFIX_PATH=/nom-du-repo/ VUE_APP_ENV=prod npm run build:pages
# Publier le contenu de app/dist (ex. branche gh-pages)
```

## Sources de données

### Grist (CSV publics)

Les URLs sont centralisées dans `app/src/config/gristUrls.json`. Des copies de secours sont stockées dans `app/public/grist-backups/` et mises à jour via :

```bash
npm run download-grist-csvs
```

### API Écolab

Indicateurs au niveau régional — nécessite un token (`VUE_APP_ECOLAB_API_TOKEN`).

## Environnement de staging

Routes `/staging/dashboard` et `/staging/tags` pour tester des documents Grist alternatifs. Une bannière rouge signale le mode staging.

## Docker

```bash
docker compose up --build
```

## Déploiement interne (Kubernetes / Helm)

Le dossier `app-front-chart/` et `.gitlab-ci.yml` documentent le déploiement sur l'infrastructure DIN (GitLab CI + Kubernetes). Ce flux est **distinct** de GitHub Pages.

```bash
# Exemple dry-run qualif
helm upgrade --install --dry-run app-front app-front-chart \
  --values app-front-chart/values_qualif.yaml \
  --namespace app-front-qualif
```

## Structure du projet

```
sgpe-app/
├── app/                    # Application Vue.js
│   ├── src/
│   │   ├── components/     # Composants UI et graphiques
│   │   ├── services/       # Grist, Écolab, analytics
│   │   └── config/         # URLs Grist, routes
│   ├── public/             # Assets statiques + backups CSV
│   └── scripts/            # Scripts build (download Grist)
├── app-front-chart/        # Chart Helm (déploiement K8s interne)
├── docs/
│   └── SECURITY-AUDIT.md   # Audit sécurité pré-open source
└── .github/workflows/      # CI GitHub Pages
```

## Sécurité

- Ne jamais committer `.env`, certificats (`certs/`), clés privées.
- Utiliser `app/.env.example` comme référence.
- Audit complet : [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md).

## Licence

À définir avant publication (ex. [Licence Ouverte Etalab 2.0](https://github.com/etalab/licence-ouverte/blob/master/LO.md) pour une application de l'État).

## Contribuer

1. Fork → branche feature → PR.
2. Tester localement (`npm run serve`, `npm run test:unit`).
3. Vérifier qu'aucun secret n'est introduit (`git diff` + scan regex).
