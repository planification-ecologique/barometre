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
          <!-- <div class="fr-header__tools-links"> -->
          <div class="france-nation-verte-logo fr-header__tools">
            <ul>
              <li>
                <a
                  href="https://www.info.gouv.fr/france-nation-verte"
                  target="_blank"
                  title="France Nation Verte - nouvelle fenêtre"
                  class="fr-btn"
                  id="header-title"
                  style="background-color: white; color: #000091"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="2 0 24 24"
                    width="18px"
                    height="18px"
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
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="fr-container--fluid desktop-navigation" v-if="showNavigation">
      <ul class="fr-btns-group mobile-display-button">
        <li>
          <a
            class="fr-btn fr-btn--icon-left"
            href="https://www.info.gouv.fr/france-nation-verte"
            target="_blank"
            aria-controls="fr-theme-modal"
            data-fr-opened="false"
            id="header-button-theme-mobile"
            title="Découvrir la planification écologique"
            data-fr-js-modal-button="true"
            data-fr-js-button-actionee="true"
            data-fr-js-header-menu-button-actionee="true"
          >
            Découvrir la planification écologique
          </a>
        </li>
      </ul>

      <navigation-dsfr></navigation-dsfr>
    </div>
  </header>
</template>

<script>
import NavigationDsfr from "./Navigation.vue";
import planifecoMapping from "@/utils/planifeco_mapping.js";

export default {
  name: "HeaderDsfr",
  components: {
    NavigationDsfr,
  },
  data() {
    return {
      accueil_link: "/dashboard?sector=Général",
      showNavigation: false,
      isDesktop: false,
    };
  },
  methods: {
    set_link() {
      let base = process.env.VUE_APP_PREFIX_PATH;
      // Get first sector from mapping
      const mapping = planifecoMapping.planifecoMapping || planifecoMapping;
      const sectors = mapping.sectors || ['Général'];
      const firstSector = sectors[0] || 'Général';
      if (base) {
        this.accueil_link = base + `/dashboard?sector=${encodeURIComponent(firstSector)}`;
      } else {
        this.accueil_link = `/dashboard?sector=${encodeURIComponent(firstSector)}`;
      }
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
    this.checkForMobile(); // Set initial state based on screen size
    window.addEventListener("resize", this.checkForMobile);
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

.leaf-logo {
  margin-right: 0.25rem;
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
}

.logo {
  order: 3;
  /* Réorganiser l'ordre d'affichage, le logo sera affiché en dernier */
  /* text-decoration: underline; */
  /* line-height: 1.25rem; */
  margin-right: 10px;
}

.france-nation-verte-logo {
  @media (max-width: 768px) {
    display: none;
  }
}

.mobile-display-button {
  display: none !important;
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

/* Show mobile button on mobile and medium (tablet) */
@media (max-width: 991px) {
  .mobile-display-button {
    display: block !important;
  }
  
  .desktop-navigation {
    display: block; /* Show navigation when toggled on mobile/tablet */
  }
}
</style>
