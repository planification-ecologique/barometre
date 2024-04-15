<template>
  <div class="fr-container--fluid fr-m-2w">
    <div class="titre-zone field">
      <div class="titre-zone-separateur haut"></div>
      <h1 class="titre-texte">Données personnelles et cookies</h1>
      <div class="titre-zone-separateur"></div>
    </div>
    <!-- /.titre-zone.field -->
    <div class="field field-name-field-description field-type-text-long field-label-hidden">
      <div class="field-items">
        <div class="field-item even first last">
          <p>
            Le Secrétariat général à la planification écologique s'engage à ce que la
            collecte et le traitement de vos données, effectués à partir du site
            barometre.planification-ecologique.gouv.fr, soient conformes au règlement général sur la
            protection des données (RGPD) et à la loi informatique et libertés.
          </p>
        </div>
      </div>
    </div>
    <div class="field field-separateur">
      <div class="entete-separateur">&nbsp;</div>
    </div>
    <div class="field field-name-field-texte field-type-text-long field-label-hidden prose">
      <div class="field-items">
        <div class="field-item even first last">
          <h2>À qui sont destinées vos données ?</h2>

          <p>
            Le Secrétariat général à la planification écologique, situé 19 rue de Constantine à Paris (75007) est
            responsable du traitement des données personnelles pour le site
            barometre.planification-ecologique.gouv.fr.<br />
            Sauf mention contraire, les données personnelles qui y sont
            collectées sont destinées à un usage interne et n’ont pas vocation à
            être partagées avec des tiers en dehors des cas prévus par les lois
            et règlements. Elles peuvent néanmoins être rendues accessibles aux
            prestataires (sous-traitants au sens de la règlementation) du
            Secrétariat général à la planification écologique, sous son contrôle, pour les
            stricts besoins et dans les limites de leur mission.
          </p>

          <h2>À quoi servent vos données ?</h2>

          <p>
            Les traitements de données personnelles mis en œuvre par le Secrétariat général à la planification
            écologique, sur la base des missions d'intérêt
            public dont il est investi, ont pour finalités de :
          </p>

          <ul>
            <li>diffuser l’information du baromètre de la planification écologique ;</li>
            <li>offrir aux utilisateurs des moyens d’interagir avec lui ;</li>
            <li>
              assurer le bon fonctionnement du site et améliorer votre
              expérience de navigation.
            </li>
          </ul>
          <h2>Comment vos données sont-elles collectées ?</h2>

          <p>
            Vos données peuvent être collectées par l’intermédiaire
            des applications présentes sur le site barometre.planification-ecologique.gouv.fr, en
            particulier des données techniques liées à votre navigation
            (l’adresse IP, les données de connexion par exemple).
          </p>

          <h2>Pendant combien de temps vos données sont-elles conservées ?</h2>

          <p>
            De manière générale, vos données sont conservées par le Secrétariat général à la planification
            écologique pendant 5 ans, sauf :
          </p>

          <ul>
            <li>Les journaux applicatifs qui sont conservés 1 an ;</li>
            <li>Votre choix en matière de cookies qui est conservé 6 mois ;</li>
            <li>
              Les données collectées grâce aux cookies qui sont conservés 25
              mois.
            </li>
          </ul>
          <h2>À propos des cookies</h2>

          <p>
            Lors de la consultation du site barometre.planification-ecologique.gouv.fr, des
            cookies sont déposés sur votre ordinateur, votre mobile ou votre
            tablette. Un "cookie" est une suite d'informations, généralement de
            petite taille et identifié par un nom, qui peut être transmis à
            votre navigateur par un site web sur lequel vous vous connectez.
            Votre navigateur web le conservera pendant une certaine durée, et le
            renverra au serveur web chaque fois que vous vous y re-connecterez.
          </p>

          <h3>
            <strong>Cookies techniques strictement nécessaires au fonctionnement du
              site</strong>
          </h3>

          <p>
            Le site barometre.planification-ecologique.gouv.fr utilise des cookies permettant au site de
            fonctionner. Ils ne peuvent pas être désactivés, sauf en refusant
            tous les cookies dans les paramètres de votre navigateur. Cependant
            votre expérience utilisateur risque d’être dégradée.
          </p>

          <h3><a id="at" name="at"></a>Cookies de mesure d’audience</h3>

          <p>
            Notre site utilise des cookies de mesure d’audience. Certains de ces
            cookies sont strictement nécessaires au fonctionnement et aux
            opérations d'administration courante du site. Vous pouvez néanmoins
            vous opposer à leur utilisation en cliquant sur le bouton suivant :
          </p>

          <p class="rtecenter">
            <a class="fr-btn" href="javascript:void(0)" id="eulerian-optout" style="text-decoration: none"
              @click="eulerian_button_status()"
              data-smarttag-click='{"name": "javascriptvoid(0)", "type": "navigation","chapter1":"donnees_personnelles_et_cookies"}'>{{
                message_button }}</a>
          </p>

          <p class="rf-text--sm" id="messageoptout"></p>

          <h2>
            Quels sont vos droits sur vos données et comment les exercer ?
          </h2>

          <p>
            Vous disposez des droits suivants en ce qui concerne l’utilisation
            de vos données personnelles :
          </p>

          <ul>
            <li>
              obtenir la confirmation que des données vous concernant sont ou ne
              sont pas traitées et, lorsqu’elles le sont, l’accès à ces données
              ainsi qu’à des informations sur ces traitements ;
            </li>
            <li>obtenir la rectification de données inexactes ;</li>
            <li>
              dans certains cas précis, obtenir l’effacement de certaines de vos
              données ;
            </li>
            <li>
              dans certains cas précis, obtenir la limitation des traitements
              que nous réalisons ;
            </li>
            <li>
              vous opposer au traitement de vos données, pour des raisons tenant
              à votre situation particulière, ou, indépendamment de votre
              situation particulière, à l’utilisation de vos données à des fins
              de prospection ;
            </li>
            <li>
              retirer pour l’avenir votre consentement à tout moment, s’il
              servait de base légale au traitement de vos données ;
            </li>
            <li>
              recevoir les données que vous avez fournies et/ou demander de les
              transmettre à un autre responsable du traitement, si le traitement
              est fondé sur votre consentement ou sur un contrat et que le
              traitement est automatisé ;
            </li>
            <li>
              si vous résidez en France, définir le sort de vos données après
              votre mort.
            </li>
          </ul>
          <p>
            Vous pouvez exercer vos droits ou obtenir des informations
            concernant le traitement de vos données personnelles directement
            auprès du référent RGPD du Secrétariat général à la planification
            écologique :
          </p>

          <p>
            <strong>Contacter le référent RGPD par voie électronique</strong> :
            sec.planification-ecologique@pm.gouv.fr
          </p>

          <p>
            <strong>Contacter le référent RGPD par courrier postal </strong>:
          </p>
          <p>
            Secrétariat général à la planification écologique (SGPE)
          </p>
          <p>
            Services du Premier ministre
          </p>
          <p>
            19 rue de Constantine
          </p>
          <p>
            75007 Paris
          </p>


          <p>
            Si la réponse apportée ne vous convient pas, vous pouvez saisir le
            délégué à la protection des données :
          </p>

          <p>
            <strong>Contacter le délégué à la protection des données par voie
              électronique </strong>:&nbsp;<a href="mailto:dpd@pm.gouv.fr"
              data-smarttag-click='{"name": "mailtodpd@pm.gouv.fr", "type": "navigation","chapter1":"donnees_personnelles_et_cookies"}'>dpd@pm.gouv.fr</a>
          </p>

          <p>
            <strong>Contacter le délégué à la protection des données par courrier
              postal</strong>
            :<br />
            Secrétariat général du Gouvernement<br />
            À l’attention du délégué à la protection des données (DPD)<br />
            56 rue de Varenne<br />
            75007 Paris
          </p>

          <p>
            <br />
            En cas de difficulté non résolue en lien avec l’utilisation de vos
            données personnelles, vous pouvez saisir la CNIL.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import dsfrAnalytics from "../services/dsfr_analytics"

export default {
  name: "PersonalDataPage",
  components: {
  },
  data() {
    return {
      querySuccess: true,
      message_button: ""
    };
  },
  methods: {
    eulerian_button_status() {
      // _EA_toggle();
      window.dsfr.analytics.opt.toggle()
      this.set_message_boutton()
    },
    set_message_boutton() {
      if (_EA_disabled()) {
        this.message_button = "Activer les cookies de la mesure d'audience strictement nécessaire";
      }
      else {
        this.message_button = "Désactiver les cookies de la mesure d'audience strictement nécessaire";
      }
    }
  },
  mounted() {
    this.set_message_boutton()

    dsfrAnalytics({
      path: "/donnees-personnelles",
      name: "/donnees-personnelles",
      segment: "contenu_statique",
      labels: ['contenu_statique', 'contenu_statique', '', '', ''],
      template: "contenu_statique",
      group: "contenu_statique"
    })
  }
};
</script>
<style>
.subtitle {
  font-weight: bold;
}
</style>
