<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          
          <div
            class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-my-7w fr-mb-md-10w"
          >
            <div class="fr-col-12 fr-col-offset-md-1 fr-col-md-6 fr-py-0">
              <h1>Requête incorrecte</h1>
              <p class="fr-text--sm fr-mb-3w">Erreur 400</p>
              <p class="fr-text--lg">
                Nous sommes désolé, mais vous n'avez pas accès à cette page ou
                cette ressource
              </p>

              <p class="fr-text--sm">
                Si vous avez tapé l’adresse web dans le navigateur, vérifiez
                qu’elle est correcte. La page n’est peut-être plus
                disponible.
                Dans ce cas, pour continuer votre visite vous pouvez consulter
                notre page d’accueil. Sinon contactez-nous pour que l’on puisse
                vous rediriger vers la bonne information.
              </p>

              <p>
                <a class="fr-btn url-alias-convert" href="/">Page d'accueil</a
                >&nbsp;
                <a
                  class="fr-btn fr-btn--secondary url-alias-convert"
                  href="/contact"
                  title="ouvrir Contactez-nous"
                  >Contactez-nous</a
                >
              </p>
            </div>
            <div
              class="fr-col-12 fr-col-md-3 fr-col-offset-md-1 fr-px-6w fr-px-md-0"
            >
              <technical-error-img></technical-error-img>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TechnicalErrorImg from "../components/components_sgv/TechnicalErrorImg.vue";

export default {
  name: "Error404Page",
  components: {
    TechnicalErrorImg,
  },
  data() {
    return {};
  },
  methods: {},
  mounted() {},
};
</script>

<style scoped lang="scss">
.fr-container-page {
  background-color: white;
  padding-top: 1.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  width: 100%;
}

.fr-subtitle {
  font-weight: 400;
}
</style>
