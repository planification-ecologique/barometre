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
| `VUE_APP_PREFIX_PATH` | Préfixe URL (vide pour prod gov.fr ; `/pr/N/` pour previews PR) | Non (défaut : `/`) |
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

## Déploiement production (GitHub Pages)

**URL cible :** [https://barometre.planification-ecologique.gouv.fr/](https://barometre.planification-ecologique.gouv.fr/)

L'application est déployée via **GitHub Pages** avec un **domaine personnalisé** (racine du domaine, `VUE_APP_PREFIX_PATH` vide). Le fallback SPA est assuré par `404.html` (généré par `npm run build:pages`).

### 1. Configurer GitHub

1. **Settings → Pages → Build and deployment** : source = **Deploy from a branch**, branche **`gh-pages`**, dossier **`/ (root)`**.
2. **Settings → Pages → Custom domain** : `barometre.planification-ecologique.gouv.fr` puis activer **Enforce HTTPS** (après propagation DNS).
3. **Settings → Secrets and variables → Actions** :
   - Secret `VUE_APP_ECOLAB_API_TOKEN` — token API Écolab pour le build CI.
   - Variable `VUE_APP_TRACKING` — défaut : `phdd.barometre.planification-ecologique.gouv.fr`
   - Variable `PAGES_CUSTOM_DOMAIN` — défaut : `barometre.planification-ecologique.gouv.fr`

### 2. Configurer le DNS

Chez le gestionnaire DNS de `planification-ecologique.gouv.fr` :

| Type | Nom | Valeur |
|------|-----|--------|
| CNAME | `barometre` | `planification-ecologique.github.io` |

Le workflow publie un fichier `CNAME` sur la branche `gh-pages` ; le record DNS ci-dessus pointe le sous-domaine vers GitHub Pages.

### 3. Workflows

| Workflow | Déclencheur | URL |
|----------|-------------|-----|
| [`deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) | push `main` / `master` | `https://barometre.planification-ecologique.gouv.fr/` |
| [`preview-github-pages.yml`](.github/workflows/preview-github-pages.yml) | PR ouverte / mise à jour | `https://barometre.planification-ecologique.gouv.fr/pr/<numéro>/` |
| [`cleanup-preview-github-pages.yml`](.github/workflows/cleanup-preview-github-pages.yml) | PR fermée | supprime `pr/<numéro>/` |

Chaque PR reçoit un commentaire avec le lien de prévisualisation.

### Déploiement manuel

```bash
cd app
VUE_APP_PREFIX_PATH= VUE_APP_ENV=prod npm run build:pages
# Publier le contenu de app/dist sur gh-pages (racine)
# Inclure CNAME (barometre.planification-ecologique.gouv.fr) et .nojekyll
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
├── app-front-chart/        # Chart Helm (legacy K8s, non utilisé pour prod)
└── .github/workflows/      # CI + déploiement GitHub Pages
```

## Sécurité

- Ne jamais committer `.env`, certificats (`certs/`), clés privées.
- Utiliser `app/.env.example` comme référence.
- Le token Écolab est visible dans le bundle client : utiliser un token à droits limités.

## Licence

À définir avant publication (ex. [Licence Ouverte Etalab 2.0](https://github.com/etalab/licence-ouverte/blob/master/LO.md) pour une application de l'État).

## Contribuer

1. Fork → branche feature → PR.
2. Tester localement (`npm run serve`, `npm run test:unit`).
3. Vérifier qu'aucun secret n'est introduit (`git diff` + scan regex).
