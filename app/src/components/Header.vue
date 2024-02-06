  <template>
    <header role="banner" class="fr-header">
      <div class="fr-header__body">
        <div class="fr-container">
          <div class="fr-header__body-row">
            <div class="fr-header__brand fr-enlarge-link">
              <div class="fr-header__brand-top">
                <div class="fr-header__logo">
                  <p class="fr-logo"> Premier <br>
                  ministre</p>
                </div>
                  <div class="fr-header__operator">
                            <a href="https://www.gouvernement.fr/dossier-de-presse/france-nation-verte" title="Accueil - France Nation Verte - République Française">
                                <img class="fr-responsive-img" style="width:5rem;" src="../images/Logo-France-Nation-Verte_medium.png" alt="[À MODIFIER - texte alternatif de l’image]" />
                                <!-- L’alternative de l’image (attribut alt) doit impérativement être renseignée et reprendre le texte visible dans l’image -->
                            </a>
                        </div>
                <div class="fr-header__navbar">
                  <button class="fr-btn--search fr-btn" data-fr-opened="false" aria-controls="modal-541" id="button-542"
                    title="Rechercher"> Rechercher </button>
                  <button class="fr-btn--menu fr-btn" data-fr-opened="false" aria-controls="modal-543"
                    aria-haspopup="menu" id="button-544" title="Menu"> Menu </button>
                </div>
              </div>
              <div class="fr-header__service"> <a href="/" title="Accueil - Baromètre de la planification écologique">
                  <p class="fr-header__service-title"> Baromètre de la planification écologique</p>
                </a>
              </div>
              
            </div>
            <div class="logo">
            </div>
            <div class="fr-header__tools">
              <div class="fr-header__search fr-modal" id="modal-541">
                <div class="fr-container fr-container-lg--fluid">
                  <button class="fr-btn--close fr-btn" aria-controls="modal-541" title="Fermer"> Fermer </button>
                </div>
              </div>
            </div>
          
          </div>
        </div>
      </div>
      <div class="fr-container">
        <navigation-dsfr></navigation-dsfr>
      </div>
    </header>
  </template>

 <script>
  export default {
    name: 'header_dsfr'
  }
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
  }
  
  </style>
  