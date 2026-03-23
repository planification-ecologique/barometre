<template>
    <div class="fr-container--fluid fr-m-2w">
        <h1>Déclaration d'accessibilité</h1>

        <p>Les Services du Premier Ministre s'engagent à rendre ses sites internet, intranet, extranet et ses progiciels
            accessibles (et ses applications mobiles et mobilier urbain numérique) conformément à l'article 47 de la loi
            n°2005-102 du 11 février 2005.</p>

        <p>À cette fin, Les Services du Premier Ministre mettent en œuvre la stratégie et les actions suivantes&nbsp;:
        </p>
        <ul>
            <li>Schéma pluriannuel de mise en accessibilité 2023-2025 &nbsp;;</li>
            <li>Plans annuels et actions réalisées associés.</li>
        </ul>

        <p>Ces documents sont disponibles sur la page dédiée sur info.gouv.fr&nbsp;: <a
                href="https://www.info.gouv.fr/publications-officielles/schemas-pluriannuels-de-la-dsaf">Schémas
                pluriannuels de la DSAF</a>.</p>

        <p>Cette déclaration d'accessibilité s'applique à https://barometre.planification-ecologique.gouv.fr/.</p>


        <h2>État de conformité</h2>
        <p>Le <a href="https://barometre.planification-ecologique.gouv.fr/">Baromètre de la planification écologique</a>
            est
            <strong>totalement conforme</strong> avec le référentiel général d'amélioration de l'accessibilité (RGAA)
        </p>

        <h2>Résultats des tests</h2>
        <p>L'audit de conformité réalisé par <a href="https://www.ethicfirst.fr" target="_blank"
                title="Ethic First (nouvelle fenêtre)">Ethic First</a> révèle que 100% des critères du RGAA version 4
            sont
            respectés.</p>

        <p>NOTE : Pour les utilisateurs de Firefox concernant les liens d'évitement, bien que le passage du focus aux
            zones
            ciblées via le clavier s'effectue correctement, le navigateur n'effectue pas le défilement attendu pour
            rendre
            ces zones visibles.</p>

        <h2>Établissement de cette déclaration d'accessibilité</h2>

        <p>Cette déclaration a été établie le 05/04/2024.</p>


        <h3>Technologies utilisées pour la réalisation du site</h3>
        <ul>
            <li>HTML5</li>
            <li>CSS</li>
            <li>JavaScript</li>
        </ul>

        <h3>Environnement de test</h3>
        <p>Les vérifications de restitution de contenus ont été réalisées sur la base de la combinaison fournie par la
            base
            de référence du RGAA, avec les versions suivantes&nbsp;:</p>

        <!-- Tests sur desktop -->
        <ul>
            <li>Firefox version 124.0.1 et NVDA 2022.1&nbsp;;</li>
            <!-- Tests sur mobile -->
            <li>Chrome et Talkback (dernières versions) sur Android version 9&nbsp;;</li>
            <li>Safari et VoiceOver (dernières versions) sur iOs version 17.4</li>
        </ul>


        <h3>Outils pour évaluer l'accessibilité</h3>
        <ul>
            <li>Module ANDI (<span lang="en">Accessible Name and Description Inspector</span>)&nbsp;;</li>
            <li><span lang="en">Colour Contrast Analyser</span>&nbsp;;</li>
            <li>Extension <span lang="en">Web Developer</span>&nbsp;;</li>
            <li>Outils pour développeurs intégrés au navigateur Firefox&nbsp;;</li>
        </ul>


        <h3>Pages du site ayant fait l'objet de la vérification de conformité</h3>
        <ul>
            <li><a href="https://barometre.planification-ecologique.gouv.fr/">Accueil</a></li>
            <li><a
                    href="https://barometre.planification-ecologique.gouv.fr/dashboard?section=synthese&theme=transverse&levier=emissions--puits">Tableau
                    de bord</a></li>
            <li><a href="https://barometre.planification-ecologique.gouv.fr/recherche">Recherche</a></li>
            <li><a href="https://barometre.planification-ecologique.gouv.fr/donnees-personnelles">Données
                    personnelles</a>
            </li>
            <li><a href="https://barometre.planification-ecologique.gouv.fr/mentions-legales">Mentions légales</a></li>
            <li><a href="https://barometre.planification-ecologique.gouv.fr/plan-du-site">Plan du site</a></li>
        </ul>

        <h2>Retour d'information et contact</h2>
        <p>Si vous n'arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable du SGPE
            pour
            être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme.</p>
        <ul>
            <li>Envoyer un message&nbsp;: <a
                    href="mailto:sec.planification-ecologique@pm.gouv.fr">sec.planification-ecologique@pm.gouv.fr</a>
            </li>
            <li>Contacter sur notre adresse postale&nbsp;:</li>
        </ul>
        <p class="company-text">Secrétariat général à la planification écologique (SGPE)</p>
        <p class="company-text">Services du Premier ministre</p>
        <p class="company-text">19 rue de Constantine</p>
        <p class="company-text">75007 Paris</p>
        <p></p>

        <h2>Voies de recours</h2>
        <p>Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du
            site,
            que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en
            droit de
            faire parvenir vos doléances ou une demande de saisine au Défenseur des droits.</p>

        <p>Plusieurs moyens sont à votre disposition&nbsp;:</p>

        <ul>
            <li>Écrire un message au
                <a href="https://formulaire.defenseurdesdroits.fr/">Défenseur des droits</a>
            </li>
            <li>Contacter le
                <a href="https://www.defenseurdesdroits.fr/saisir/delegues">délégué du Défenseur des droits</a> dans
                votre
                région
            </li>
            <li>Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre) à Défenseur des droits, Libre
                réponse
                71120, 75342 Paris CEDEX 07
            </li>
        </ul>
    </div>
</template>

<style>

/* Styles l'adresse de la société */
.company-text {
  font-style: italic;
  margin-bottom: 0;  
}

</style>



<script>
export default {
    name: "AccessibilityPage"
}
</script>