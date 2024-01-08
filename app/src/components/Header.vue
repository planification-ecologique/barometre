<template>
    <header role="banner" class="fr-header">
        <div class="fr-header__body">
            <div class="fr-container">
                <div class="fr-header__body-row">
                    <div class="fr-header__brand fr-enlarge-link">
                        <div class="fr-header__brand-top">
                            <div class="fr-header__logo">
                                <p class="fr-logo">
                                    Gouvernement
                                </p>
                            </div>
                        </div>
                        <div class="fr-header__service">
                            <a href="https://www.gouvernement.fr/" title="gouvernement.fr">
                                <p class="fr-header__service-title">
                                Baromêtre autour des sites Internet de l'Etat
                                </p>
                            </a>
                            <p class="fr-header__service-tagline"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class=" fr-container">
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
    border-bottom: 1px solid rgba(207, 207, 223, 0.534);
}
</style>
