<template>
    <header role="banner" class="fr-header">
        <div class="fr-header__body">
            <div class="fr-container">
                <div class="fr-header__body-row">
                    <div class="fr-header__brand fr-enlarge-link">
                        <div class="fr-header__brand-top">
                            <div class="fr-header__logo">
                                <p class="fr-logo"> République Française </p>
                            </div>
                            <div class="fr-header__navbar"> <button class="fr-btn--menu fr-btn" data-fr-opened="false"
                                    aria-controls="modal-499" aria-haspopup="menu" id="button-500" title="Menu"> Menu
                                </button> </div>
                        </div>
                        <div class="fr-header__service"> <a href="/"
                                title="Accueil - [À MODIFIER - Nom du site / service] - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)">
                                <p class="fr-header__service-title"> Planification écologique </p>
                            </a>
                            <p class="fr-header__service-tagline">Planifier et accélérer la transition écologique</p>
                        </div>
                    </div>
                    <div class="fr-header__tools">
                        <div class="fr-header__tools-links">
                            <ul class="fr-btns-group">
                                <li>
                                    <button class="fr-btn fr-icon-theme-fill" aria-controls="fr-theme-modal"
                                        data-fr-opened="false">Paramètres d'affichage</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="fr-header__menu fr-modal" id="modal-499" aria-labelledby="button-500">
            <div class="fr-container"> <button class="fr-btn--close fr-btn" aria-controls="modal-499" title="Fermer"> Fermer
                </button>
                <div class="fr-header__menu-links"> </div>
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
