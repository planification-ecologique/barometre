<template>
      <dialog
    id="fr-consent-modal"
    aria-labelledby="fr-consent-modal-title"
    class="fr-modal fr-modal--opened"
    data-fr-js-modal="true"
    aria-modal="true"
    open="true"
  >
    <div class="fr-container fr-container--fluid fr-container-md">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-md-10 fr-col-lg-8">
          <div
            class="fr-modal__body fr-scroll-divider"
            data-fr-js-modal-body="true"
            style="--modal-max-height: 812px"
          >
            <div class="fr-modal__header">
              <button
                aria-controls="fr-consent-modal"
                class="fr-btn fr-btn--close"
                data-fr-js-modal-button="true"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="fr-consent-modal-title" class="fr-modal__title">
                Panneau de gestion des cookies
              </h1>
              <div class="fr-consent-manager">
                <div class="fr-consent-service fr-consent-manager__header">
                  <fieldset class="fr-fieldset fr-fieldset--inline">
                    <legend class="fr-consent-service__title">
                      Préférences pour tous les services. <br /><a
                        href="/mentions-legales"
                        aria-controls="fr-consent-modal"
                        class=""
                        data-fr-js-modal-button="true"
                        >Données personnelles et cookies</a
                      >
                    </legend>
                    <div class="fr-consent-service__radios">
                      <div
                        class="fr-btns-group fr-btns-group--inline fr-btns-group--right"
                      >
                        <button
                          id="consent-service__tout-accepter"
                          title="Tout accepter"
                          class="fr-btn"
                          data-fr-js-button-actionee="true"
                        >
                          Tout accepter
                        </button>
                        <button
                          id="consent-service__tout-refuser"
                          title="Tout refuser"
                          class="fr-btn fr-btn--secondary"
                          data-fr-js-button-actionee="true"
                        >
                          Tout refuser
                        </button>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div class="fr-consent-service">
                  <fieldset class="fr-fieldset fr-fieldset--inline">
                    <legend
                      aria-describedby="finality-0-desc"
                      class="fr-consent-service__title"
                    >
                      Cookies obligatoires
                    </legend>
                    <div class="fr-consent-service__radios">
                      <div class="fr-radio-group">
                        <input
                          checked=""
                          disabled=""
                          type="radio"
                          id="consent-finality-0-accept"
                          name="consent-finality-0"
                        />
                        <label for="consent-finality-0-accept" class="fr-label"
                          >Accepter
                        </label>
                      </div>
                      <div class="fr-radio-group">
                        <input
                          disabled=""
                          type="radio"
                          id="consent-finality-0-refuse"
                          name="consent-finality-0"
                        />
                        <label for="consent-finality-0-refuse" class="fr-label"
                          >Refuser
                        </label>
                      </div>
                    </div>
                    <p id="finality-0-desc" class="fr-consent-service__desc">
                      Ce site utilise des cookies nécessaires à son bon
                      fonctionnement qui ne peuvent pas être désactivés.
                    </p>
                  </fieldset>
                </div>
                <div class="fr-consent-service">
                  <fieldset class="fr-fieldset fr-fieldset--inline">
                    <legend
                      aria-describedby="finality-vimeo-desc"
                      class="fr-consent-service__title"
                    >
                      Vimeo
                    </legend>
                    <div class="fr-consent-service__radios">
                      <div class="fr-radio-group">
                        <input
                          type="radio"
                          id="consent-finality-vimeo-accept"
                          name="consent-finality-vimeo"
                        />
                        <label
                          for="consent-finality-vimeo-accept"
                          class="fr-label"
                          >Accepter
                        </label>
                      </div>
                      <div class="fr-radio-group">
                        <input
                          type="radio"
                          id="consent-finality-vimeo-refuse"
                          name="consent-finality-vimeo"
                          checked=""
                        />
                        <label
                          for="consent-finality-vimeo-refuse"
                          class="fr-label"
                          >Refuser
                        </label>
                      </div>
                    </div>
                    <p
                      id="finality-vimeo-desc"
                      class="fr-consent-service__desc"
                    >
                      Ce service peut déposer 8 cookies.
                    </p>
                  </fieldset>
                </div>
                <div class="fr-consent-service">
                  <fieldset class="fr-fieldset fr-fieldset--inline">
                    <legend
                      aria-describedby="finality-youtube-desc"
                      class="fr-consent-service__title"
                    >
                      Youtube
                    </legend>
                    <div class="fr-consent-service__radios">
                      <div class="fr-radio-group">
                        <input
                          type="radio"
                          id="consent-finality-youtube-accept"
                          name="consent-finality-youtube"
                        />
                        <label
                          for="consent-finality-youtube-accept"
                          class="fr-label"
                          >Accepter
                        </label>
                      </div>
                      <div class="fr-radio-group">
                        <input
                          type="radio"
                          id="consent-finality-youtube-refuse"
                          name="consent-finality-youtube"
                          checked=""
                        />
                        <label
                          for="consent-finality-youtube-refuse"
                          class="fr-label"
                          >Refuser
                        </label>
                      </div>
                    </div>
                    <p
                      id="finality-youtube-desc"
                      class="fr-consent-service__desc"
                    >
                      Ce service peut déposer 4 cookies.
                    </p>
                  </fieldset>
                </div>
                <ul
                  class="fr-consent-manager__buttons fr-btns-group fr-btns-group--right fr-btns-group--inline-sm"
                >
                  <li>
                    <button
                      id="consent-service__confirmer-choix"
                      aria-controls="fr-consent-modal"
                      title="Confirmer mes choix"
                      class="fr-btn"
                      data-fr-js-modal-button="true"
                      data-fr-js-button-actionee="true"
                    >
                      Confirmer mes choix
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script>

export default {
  name: 'GraphBox',
  components: {
  },
  props: {
  },
  data() {
      return {          
      }
  },
  methods: {
  },
  mounted () {    
  }
}
</script>

<style>

</style>