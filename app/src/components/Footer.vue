<template>
    <footer class="fr-footer" role="contentinfo" id="footer">
        <div class="footer-container">
            <div class="fr-footer__body">
                <div class="fr-footer__brand fr-enlarge-link">
                    <a href="/" title="Retour à l’accueil du site - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)">
                        <p class="fr-logo">
                            GOUVERNEMENT
                        </p>
                    </a>
                </div>
                <div class="fr-footer__content">
                    <p class="fr-footer__content-desc">Ce site est géré par le Service d’information du Gouvernement (SIG).</p>
                    <ul class="fr-footer__content-list">
                        <li class="fr-footer__content-item">
                            <a class="fr-footer__content-link" target="_blank" rel="noopener external" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="https://legifrance.gouv.fr">legifrance.gouv.fr</a>
                        </li>
                        <li class="fr-footer__content-item">
                            <a class="fr-footer__content-link" target="_blank" rel="noopener external" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="https://gouvernement.fr">gouvernement.fr</a>
                        </li>
                        <li class="fr-footer__content-item">
                            <a class="fr-footer__content-link" target="_blank" rel="noopener external" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="https://service-public.fr">service-public.fr</a>
                        </li>
                        <li class="fr-footer__content-item">
                            <a class="fr-footer__content-link" target="_blank" rel="noopener external" title="[À MODIFIER - Intitulé] - nouvelle fenêtre" href="https://data.gouv.fr">data.gouv.fr</a>
                        </li>
                    </ul>
                </div>
            </div>
                <navigation-footer></navigation-footer>

                <div class="fr-footer__bottom-copy">
                  <p>Sauf mention explicite de propriété intellectuelle détenue par des tiers, les contenus de ce site sont proposés sous <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" target="_blank" rel="noopener external" title="[À MODIFIER - Intitulé] - nouvelle fenêtre">licence etalab-2.0</a>
                  </p>
                </div>
            <!-- <div class="fr-footer__bottom">
                <ul class="fr-footer__bottom-list">
                    <li class="fr-footer__bottom-item">
                        <a class="fr-footer__bottom-link" href="#">Plan du site</a>
                    </li>
                    <li class="fr-footer__bottom-item">
                        <a class="fr-footer__bottom-link" href="#">Accessibilité : non/partiellement/totalement conforme</a>
                    </li>
                    <li class="fr-footer__bottom-item">
                        <a class="fr-footer__bottom-link" href="#">Mentions légales</a>
                    </li>
                    <li class="fr-footer__bottom-item">
                        <a class="fr-footer__bottom-link" href="#">Données personnelles</a>
                    </li>
                  
                    <li class="fr-footer__bottom-item">
                        <a class="fr-footer__bottom-link" href="#">Gestion des cookies</a>
                        
                    </li>
                </ul>
                
            </div> -->
        </div>
    </footer>
    
    </template>
    
    <script>
        
import NavigationFooter from './NavigationFooter.vue'
    
    export default {
      name: 'footer_dsfr',
      components: {
        NavigationFooter
      },
      data () {
        return {
        }
      },
      computed: {
      },
      methods: {
      },
      mounted () {
      }
    }
    </script>
    <style >
.footer-container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
}
    </style>
    