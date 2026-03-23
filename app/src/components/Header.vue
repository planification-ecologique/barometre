<template>
  <header role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="header-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand">
            <div class="fr-header__brand-top">
              <a href="/" target="_self" title="Premier Ministre">
                <div class="fr-header__logo">
                  <p class="fr-logo">Gouvernement</p>
                </div>
              </a>

              <div class="fr-header__operator">
                <a
                  href="https://www.info.gouv.fr/france-nation-verte"
                  target="_self"
                >
                  <img
                    class="fr-responsive-img"
                    style="width: 6rem"
                    src="../images/Logo-France-Nation-Verte_medium.png"
                    alt="Site de France nation verte"
                    title="France Nation Verte"
                  />
                </a>
                <!-- L'alternative de l'image (attribut alt) doit impérativement être renseignée et reprendre le texte visible dans l'image -->
              </div>
              <div class="fr-header__navbar">
                <button
                  class="fr-btn--menu fr-btn"
                  data-fr-opened="false"
                  aria-controls="modal-543"
                  :aria-expanded="showNavigation.toString()"
                  id="modal-543"
                  title="Menu"
                  @click="toggleNavigation"
                  :class="{ 'desktop-hidden': isDesktop }"
                >
                  Menu
                </button>
              </div>
            </div>
            <div class="fr-header__service">
              <a
                :href="accueil_link"
                title="Tableau de bord - Baromètre de la planification écologique"
              >
                <p class="fr-header__service-title">
                  Baromètre de la planification écologique
                </p>
              </a>
            </div>
          </div>

          <div class="fr-header__tools">
            <div class="fr-header__search fr-modal" id="modal-541">
              <div class="fr-container fr-container-lg--fluid">
                <button
                  class="fr-btn--close fr-btn"
                  aria-controls="modal-541"
                  title="Fermer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
          <div class="header-right-tools fr-header__tools">
            <div class="header-right-tools-inner">
              <a
                href="https://www.info.gouv.fr/france-nation-verte"
                target="_blank"
                title="Découvrir la planification écologique - nouvelle fenêtre"
                class="header-decouvrir-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="2 0 24 24"
                  width="16px"
                  height="16px"
                  aria-hidden="true"
                  focusable="false"
                  class="leaf-logo"
                >
                  <path fill="none" d="M0 0H24V24H0z"></path>
                  <path
                    d="M21 3v2c0 9.627-5.373 14-12 14H5.243C5.08 19.912 5 20.907 5 22H3c0-1.363.116-2.6.346-3.732C3.116 16.974 3 15.218 3 13 3 7.477 7.477 3 13 3c2 0 4 1 8 0zm-8 2c-4.418 0-8 3.582-8 8 0 .362.003.711.01 1.046 1.254-1.978 3.091-3.541 5.494-4.914l.992 1.736C8.641 12.5 6.747 14.354 5.776 17H9c6.015 0 9.871-3.973 9.997-11.612-1.372.133-2.647.048-4.22-.188C13.627 5.027 13.401 5 13 5z"
                    style="fill: var(--text-action-high-green-archipel)"
                  ></path>
                </svg>
                Découvrir la planification écologique
              </a>
              <div class="fr-search-bar header-search-bar" role="search">
                <label class="fr-label" for="header-search-input">
                  Rechercher
                </label>
                <input
                  ref="headerSearchInput"
                  v-model="headerSearchQuery"
                  class="fr-input"
                  type="search"
                  id="header-search-input"
                  name="header-search-input"
                  placeholder="Rechercher"
                  autocomplete="off"
                  @keyup.enter="submitSearch"
                >
                <button
                  class="fr-btn"
                  type="button"
                  title="Rechercher"
                  aria-label="Rechercher"
                  @click="submitSearch"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fr-container--fluid desktop-navigation" v-if="showNavigation">
      <navigation-dsfr></navigation-dsfr>
    </div>
  </header>
</template>

<script>
import NavigationDsfr from "./Navigation.vue";

export default {
  name: "HeaderDsfr",
  components: {
    NavigationDsfr,
  },
  data() {
    return {
      accueil_link: "/",
      search_link: "/recherche",
      showNavigation: false,
      isDesktop: false,
      headerSearchQuery: "",
    };
  },
  watch: {
    $route(to) {
      if (to.name === "recherche" || to.name === "staging-recherche") {
        this.headerSearchQuery = to.query.q || "";
      }
      // Fermer le panneau menu mobile après navigation (liens du header)
      if (!this.isDesktop) {
        this.showNavigation = false;
      }
    },
  },
  methods: {
    set_link() {
      let base = process.env.VUE_APP_PREFIX_PATH;
      const isStaging = window.location.pathname.includes('/staging');
      const stagingPrefix = isStaging ? '/staging' : '';
      if (base) {
        this.accueil_link = base + (isStaging ? "/staging" : "/");
        this.search_link = base + stagingPrefix + '/recherche';
      } else {
        this.accueil_link = isStaging ? "/staging" : "/";
        this.search_link = stagingPrefix + '/recherche';
      }
    },
    goToSearch() {
      this.submitSearch();
    },
    submitSearch() {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-recherche' : 'recherche';
      const query = this.headerSearchQuery?.trim() ? { q: this.headerSearchQuery.trim() } : {};
      this.$router.push({ name: routeName, query }).catch(() => {});
    },
    toggleNavigation() {
      // On desktop, don't toggle - menu is always visible
      if (window.innerWidth > 991) {
        return;
      }
      // On mobile/tablet, toggle menu
      this.showNavigation = !this.showNavigation;
    },
    checkForMobile() {
      const width = window.innerWidth;
      this.isDesktop = width > 991;
      
      // On desktop (> 991px), always show navigation
      if (this.isDesktop) {
        this.showNavigation = true;
      } else {
        // On mobile/tablet, keep current state (don't auto-open)
        // Only close if user manually closed it
      }
    },
  },
  mounted() {
    this.set_link();
    this.checkForMobile();
    window.addEventListener("resize", this.checkForMobile);
    if (this.$route.name === "recherche" || this.$route.name === "staging-recherche") {
      this.headerSearchQuery = this.$route.query.q || "";
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.checkForMobile);
  },
};
</script>

<style>
.desktop-navigation {
  display: block;
}


.fr-header__body {
  width: 100%;
  border-bottom: 1px solid rgba(207, 207, 223, 0.534);
}

.header-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

.fr-header__brand {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}


.header-search-bar {
  width: 100%;
  max-width: 25rem;
}

.logo {
  order: 3;
  /* Réorganiser l'ordre d'affichage, le logo sera affiché en dernier */
  /* text-decoration: underline; */
  /* line-height: 1.25rem; */
  margin-right: 10px;
}

/* Header right tools: link + search stacked, top-right */
.header-right-tools {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.header-right-tools-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.leaf-logo {
  margin-right: 0.25rem;
}

.header-decouvrir-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background-color: white;
  color: #000091;
  text-decoration: none;
  font-size: 0.875rem;
  white-space: nowrap;
  padding: 0.375rem 0;
}

.header-decouvrir-btn:hover {
  text-decoration: underline;
  background-image: none;
}

/* Même seuil que le bouton Menu / nav DSFR (992px) : pas de barre recherche + CTA à droite en même temps que le menu burger */
@media (max-width: 991px) {
  .header-right-tools {
    display: none;
  }

  .header-search-bar {
    max-width: 100%;
  }

  .desktop-navigation {
    display: block;
  }
}

/* Hide menu button on desktop */
.desktop-hidden {
  display: none !important;
}

/* Desktop: always show navigation */
@media (min-width: 992px) {
  .desktop-navigation {
    display: block !important;
  }
  
  .fr-header__navbar {
    display: none; /* Hide menu button on desktop */
  }
}
</style>
