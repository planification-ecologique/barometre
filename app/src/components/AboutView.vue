<template>
  <div class="fr-my-2w">
    <div class="fr-grid-row">
      <article class="fr-col-12">
        <h1 class="fr-title">Le baromètre de la planification écologique</h1>
      </article>
    </div>

    <div class="fr-mt-4w about-content">
      <p>
        <strong>Le baromètre de la planification écologique</strong>
      </p>

      <p>
        Entreprises, pouvoirs publics ou citoyens, la transition écologique nous concerne tous. Pour réussir, elle demande de la transparence sur le chemin à parcourir, et une vision claire des objectifs à atteindre. <strong>C'est l'objet du baromètre de la planification écologique.</strong>
      </p>

      <p>
        Ce tableau de bord a vu sa structure renouvelée. En effet, il repose désormais sur <strong>le référentiel de la planification écologique</strong>, qui synthétise les stratégies environnementales nationales, en distinguant d'une part des <strong>engagements</strong>, impacts visés sur l'environnement, pour chacun des six axes de la taxonomie européenne, d'autre part les modes d'actions identifiés pour les respecter, structurés en <strong>chantiers</strong> regroupant différents <strong>leviers</strong> opérationnels. Le baromètre de la planification écologique propose ainsi une vision systémique de nos objectifs de transition puisqu'il compile <strong>des indicateurs pour nos engagements, chantiers et leviers appliqués à toutes les stratégies nationales</strong> dont s'est dotée la France en vue d'atteindre ses objectifs de transition écologique.
      </p>

      <p>
        Fort de <strong>plus de 150 indicateurs</strong>, le baromètre propose ainsi une <strong>vision quantifiée et partagée</strong> des actions qu'il conviendrait de mener pour accélérer la transition, en les mettant en regard de leurs cibles à horizon 2030. En revanche, bien que la France soit dotée d'un Plan national d'Adaptation au Changement climatique, nous disposons à ce stade de peu d'indicateurs permettant de piloter nos efforts d'adaptation, puisque les données quantifiables concernent davantage les dommages qui seraient engendrés par une adaptation tardive voire inexistante au changement climatique.
      </p>

      <p>
        Sa lecture permet d'appréhender l'ampleur et la complexité des changements à opérer, tout en révélant - pour chaque engagement, chantier et levier - le caractère réalisable de ces objectifs. Ainsi, les trajectoires présentées y sont de deux natures <strong>: la tendance actuelle</strong> basée sur les données des 3 dernières années disponibles d'une part ; <strong>et d'autre part celle qui serait souhaitable</strong> pour atteindre ces cibles, que celles-ci soient annualisées ou non.
      </p>

      <p>
        Ce baromètre est le fruit d'un <strong>travail interministériel essentiel qui va se poursuivre</strong> en intégrant à la fois de nouvelles données (implémentation d'indicateurs des futures stratégies nationales, objectifs post-2030 …) <strong>et de nouveaux enjeux</strong> (disponibilité de la donnée, coordination avec les autres bases de données existantes, tableaux spécifiques pour certains territoires, notamment ultramarins, etc.). Les données utilisées viennent de bases publiques, de rapports officiels et d'études scientifiques, et sont <strong>trimestriellement mises à jour</strong>. Les sources sont précisées pour chaque indicateur, avec accès possible aux données brutes.
      </p>

      <p class="fr-mt-4w">
        <a href="https://www.planification-ecologique.gouv.fr" class="fr-link" target="_blank" rel="noopener">
          En savoir plus sur la planification écologique
        </a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutView",
  props: {
    params: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style scoped>
.fr-title {
  margin-bottom: 0.625rem;
}

.about-content {
  max-width: 800px;
}

.about-content p {
  margin-bottom: 1.5rem;
  line-height: 1.7;
}
</style>
