<template>
    <nav role="navigation" class="fr-breadcrumb" aria-label="vous êtes ici :">
        <!-- <button class="fr-breadcrumb__button" aria-expanded="false" aria-controls="breadcrumb-1">
            Voir le fil d’Ariane
        </button>
        <section>
            <div class="fr-collapse" id="breadcrumb-1">
                <ol class="fr-breadcrumb__list">
                    <li> <a class="fr-breadcrumb__link" href="/">Accueil</a> </li>
                    <li> <a class="fr-breadcrumb__link" aria-current="page">Tableau de bord</a> </li>
                </ol>
            </div>

            
        </section> -->
        <div class="fr-my-5w">
            <section class="fr-my-5w">
                <div class="fr-collapse" id="breadcrumb-contents" data-fr-js-collapse="true"
                    data-fr-js-breadcrumb-actionee="true">
                    <ol class="fr-breadcrumb__list">
                        <li>
                            <a class="fr-breadcrumb__link" href="/" target="_self" data-concat-module="acces"
                                id="breadcrumb__link-accueil" data-fr-js-breadcrumb-link-actionee="true">Accueil</a>
                        </li>
                        <li>
                            <a class="fr-breadcrumb__link" aria-current="page" id="fr-breadcrumb__link-current-page">Tableau
                                de bord</a>
                        </li>
                    </ol>
                    <div>
                        <h1>Tableau de bord de la planification écologique</h1>
                        <p>Indicateurs et objectif pour la transition écologique</p>
                    </div>
                </div>
            </section>
        </div>
    </nav>
</template>
  
<script>
export default {
    name: 'Breadcrumb',
    data() {
        return {

        }
    },
    props: {

    },
    computed: {

    },
    methods: {

    },

}
</script>
<style scoped></style>
  