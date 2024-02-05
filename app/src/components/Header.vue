<template>
<<<<<<< HEAD
  <header role="banner" class="fr-header">
    <div class="fr-header__body">
      <div class="fr-container">
        <div class="fr-header__body-row">
          <div class="fr-header__brand fr-enlarge-link">
            <div class="fr-header__brand-top">
              <div class="fr-header__logo">
                <p class="fr-logo">Gouvernement</p>
=======
    <header role="banner" class="fr-header">
      <div class="fr-header__body">
        <div class="fr-container">
          <div class="fr-header__body-row">
            <div class="fr-header__brand fr-enlarge-link">
              <div class="fr-header__brand-top">
                <div class="fr-header__logo">
                  <p class="fr-logo"> GOUVERNEMENT</p>
                </div>
                <div class="fr-header__navbar">
                  <button class="fr-btn--search fr-btn" data-fr-opened="false" aria-controls="modal-541" id="button-542"
                    title="Rechercher"> Rechercher </button>
                  <button class="fr-btn--menu fr-btn" data-fr-opened="false" aria-controls="modal-543"
                    aria-haspopup="menu" id="button-544" title="Menu"> Menu </button>
                </div>
              </div>
              <div class="fr-header__service"> <a href="/" title="Accueil - [À MODIFIER - Nom du site / service] - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)">
                  <p class="fr-header__service-title"> Baromètre de la planification écologique</p>
                </a>
              </div>
              
            </div>
            <div class="logo">
              <img src="../images/Logo-France-Nation-Verte_medium.png" alt="logo-france-nation-verte">
            </div>
            <div class="fr-header__tools">
              <div class="fr-header__search fr-modal" id="modal-541">
                <div class="fr-container fr-container-lg--fluid">
                  <button class="fr-btn--close fr-btn" aria-controls="modal-541" title="Fermer"> Fermer </button>
                </div>
>>>>>>> 5ae0d3b99950dcc83370a199904b8c80c83efec1
              </div>
            </div>
            <div class="fr-header__service">
              <a href="https://www.gouvernement.fr/" title="gouvernement.fr">
                <p class="fr-header__service-title">
                  Baromètre de la planification écologique
                </p>
              </a>
            </div>
        
          </div>
          
        </div>
              <div>
           <img
              src="../images/Logo-France-Nation-Verte_medium.png"
              alt="logo-france-nation-verte"
            />
      </div>
<<<<<<< HEAD
=======
      <div class="fr-container">
        <navigation-dsfr></navigation-dsfr>
>>>>>>> 5ae0d3b99950dcc83370a199904b8c80c83efec1
      </div>

    </div>
    <div class="fr-container">
      <navigation-dsfr></navigation-dsfr>
    </div>
  </header>
</template>

<script>
export default {
  name: "header_dsfr",
};
</script>

<style>
.fr-container {
  display: flex;
  justify-content: space-between;
}
.fr-header__body {
  border-bottom: 1px solid rgba(207, 207, 223, 0.534);
}
.fr-header__body-row {
  display: flex;
  justify-content: space-between;
}
</style>
