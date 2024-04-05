<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
              <error-page :serieObj=cardError></error-page>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import ErrorPage from '../components/ErrorPage.vue'
import TechnicalErrorImg from "../components/components_sgv/TechnicalErrorImg.vue";

export default {
  name: "Error404Page",
  components: {
    TechnicalErrorImg,
    ErrorPage
  },
  data() {
    return {
      querySuccess : true,
      cardError:{
        title:'Requête incorrecte',
        errorType:"Erreur 400",
        description:`   Nous sommes désolé, mais vous n'avez pas accès à cette page ou
                cette ressource.`,
        advice:`   Si vous avez tapé l’adresse web dans le navigateur, vérifiez
                qu’elle est correcte. La page n’est peut-être plus disponible.
                
                Dans ce cas, pour continuer votre visite vous pouvez consulter
                notre page d’accueil. Sinon contactez-nous pour que l’on puisse
                vous rediriger vers la bonne information.`,
      }
    };
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
