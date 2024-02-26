<template>
  <header role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container--fluid">
        <div class="fr-header__body-row">
          
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                 <p class="fr-logo">
                  Premier <br />
                  ministre
                </p>
              </div>
                     <div class="fr-header__operator">
                <img
                  class="fr-responsive-img"
                  style="width: 6rem"
                  src="../images/Logo-France-Nation-Verte_medium.png"
                  alt="logo france nation verte"
                />
              </div>
              <div class="fr-header__navbar">
                <button
                  id="header-search-btn"
                  class="fr-btn--search fr-btn"
                  data-fr-opened="false"
                  aria-controls="modal-searchbar"
                  title="Rechercher"
                  data-fr-js-modal-button="true"
                >
                  Rechercher
                </button>
                <button
                  class="fr-btn--menu fr-btn"
                  data-fr-opened="false"
                  aria-controls="header-navigation"
                  aria-haspopup="menu"
                  title="Ouvrir le menu"
                  id="fr-btn-menu-mobile-4"
                  data-fr-js-modal-button="true"
                >
                  Ouvrir le menu
                </button>
              </div>
            </div>

            <div class="fr-header__service">
              <a href="/" title="Les Harkis - Retour à l'accueil">
                <p class="fr-header__service-title">
                  Baromètre de la planification écologique
                </p>
              </a>
              <p class="fr-header__service-tagline"></p>
            </div>
          </div>



          <div class="fr-header__tools">

            <div class="fr-header__tools-links" data-fr-js-header-links="true">
              <ul class="">
    
                <!-- <li> -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16px"
                    height="16px"
                    aria-hidden="true"
                    focusable="false"
                    class=""
                  >
                    <path fill="none" d="M0 0H24V24H0z"></path>
                    <path
                      d="M21 3v2c0 9.627-5.373 14-12 14H5.243C5.08 19.912 5 20.907 5 22H3c0-1.363.116-2.6.346-3.732C3.116 16.974 3 15.218 3 13 3 7.477 7.477 3 13 3c2 0 4 1 8 0zm-8 2c-4.418 0-8 3.582-8 8 0 .362.003.711.01 1.046 1.254-1.978 3.091-3.541 5.494-4.914l.992 1.736C8.641 12.5 6.747 14.354 5.776 17H9c6.015 0 9.871-3.973 9.997-11.612-1.372.133-2.647.048-4.22-.188C13.627 5.027 13.401 5 13 5z"
                      style="fill: var(--text-action-high-green-archipel)"
                    ></path>
                  </svg>
                  <a
                    href="https://www.gouvernement.fr/france-nation-verte"
                    target="_blank"
                    title="France Nation Verte"
                    class="fr-btn"
                  >
                    France Nation Verte
                  </a>
                <!-- </li> -->

              </ul>
            </div>

          
            <div
              class="fr-header__search fr-modal"
              id="modal-searchbar"
              data-fr-js-modal="true"
              data-fr-js-header-modal="true"
              role="dialog"
              aria-labelledby="header-search-btn"
            >
              <div class="fr-container fr-container-lg--fluid">
                <button
                  class="fr-btn fr-btn--close"
                  aria-controls="modal-searchbar"
                  data-fr-js-modal-button="true"
                >
                  Fermer
                </button>
                <form
                  class="header-searchbar"
                  data-drupal-selector="header-searchbar"
                  action="/recherche"
                  method="GET"
                  id="header-searchbar"
                  accept-charset="UTF-8"
                  data-drupal-form-fields="edit-search,edit-valider"
                >
                  <div
                    class="fr-search-bar"
                    id="header-search"
                    role="search"
                    aria-label="Rechercher sur tout le site"
                  >
                    <!-- <label class="fr-label" for="search-865-input">
          Rechercher
        </label> -->
                    <!-- <input class="fr-input" placeholder="Rechercher" type="search" id="search-865-input" aria-label="Rechercher" name="search_api_fulltext"> -->
                    <!-- <button class="fr-btn" title="Rechercher">
          Rechercher
        </button> -->
                  </div>
                </form>
              </div>
            </div>

            <!-- END OUTPUT from 'profiles/custom/design_system_profile/modules/custom/ds_header_searchbar/templates/form--header-searchbar.html.twig' -->

            <!-- END OUTPUT from 'profiles/custom/design_system_profile/themes/design_system/templates/block/block--no-wrapper.html.twig' -->
          </div>

          <!-- END OUTPUT from 'profiles/custom/design_system_profile/themes/design_system/templates/block/block--ds-headertools.html.twig' -->
        </div>
      </div>
    </div>
    <!-- <div class="fr-header__body">
      <div class="header-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">
                  Premier <br />
                  ministre
                </p>
              </div>
              <div class="fr-header__operator">
                <img
                  class="fr-responsive-img"
                  style="width: 6rem"
                  src="../images/Logo-France-Nation-Verte_medium.png"
                  alt="logo france nation verte"
                />
              </div>
              <div class="fr-header__navbar">
                <button
                  class="fr-btn--search fr-btn"
                  data-fr-opened="false"
                  aria-controls="modal-541"
                  id="button-542"
                  title="Rechercher"
                >
                  Rechercher
                </button>
                <button
                  class="fr-btn--menu fr-btn"
                  data-fr-opened="false"
                  aria-controls="modal-543"
                  aria-haspopup="menu"
                  id="button-544"
                  title="Menu"
                >
                  Menu
                </button>
              </div>
            </div>
            <div class="fr-header__service">
              <a
                href="/"
                title="Accueil - Baromètre de la planification écologique"
              >
                <p class="fr-header__service-title">
                  Baromètre de la planification écologique
                </p>
              </a>
            </div>
          </div>
          <div class="logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16px"
              height="16px"
              aria-hidden="true"
              focusable="false"
              class="fr-mr-1v"
            >
              <path fill="none" d="M0 0H24V24H0z"></path>
              <path
                d="M21 3v2c0 9.627-5.373 14-12 14H5.243C5.08 19.912 5 20.907 5 22H3c0-1.363.116-2.6.346-3.732C3.116 16.974 3 15.218 3 13 3 7.477 7.477 3 13 3c2 0 4 1 8 0zm-8 2c-4.418 0-8 3.582-8 8 0 .362.003.711.01 1.046 1.254-1.978 3.091-3.541 5.494-4.914l.992 1.736C8.641 12.5 6.747 14.354 5.776 17H9c6.015 0 9.871-3.973 9.997-11.612-1.372.133-2.647.048-4.22-.188C13.627 5.027 13.401 5 13 5z"
                style="fill: var(--text-action-high-green-archipel)"
              ></path>
            </svg>
            <a
              class="fr-link fr-icon-external-link-line"
              href="https://www.gouvernement.fr/france-nation-verte"
              target="_blank"
              >France Nation Verte</a
            >
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
        </div>
      </div>
    </div>
    <div class="fr-container--fluid">
      <navigation-dsfr></navigation-dsfr>
    </div> -->
  </header>
</template>

<script>
export default {
  name: "header_dsfr",
};
</script>

<style>
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
  order: 3; /* Réorganiser l'ordre d'affichage, le logo sera affiché en dernier */
  /* text-decoration: underline; */
  /* line-height: 1.25rem; */
  margin-right: 10px;
}
.header-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
