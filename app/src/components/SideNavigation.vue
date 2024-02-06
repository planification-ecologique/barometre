<template>
  <nav class="fr-sidemenu fr-sidemenu--sticky-full-height fr-sidemenu__padding" role="navigation" aria-labelledby="fr-sidemenu-title">
    <div class="fr-sidemenu__inner"> 
      <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper"
        aria-expanded="false"> Dans cette rubrique 
      </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <!-- <div class="fr-sidemenu__title" id="fr-sidemenu-title">Introduction</div> -->
        <ul class="fr-sidemenu__list">


          <li class="fr-sidemenu__item fr-sidemenu__item--active">
            <a
              class="fr-sidemenu__link"
              @click="emitSelection(['Vue d\'ensemble', 'Atténuation'])"
              href="#"
              target="_self"
              aria-current="page"
              >Vue d'ensemble</a>
          </li>          
        <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-3"> Transverse </button>
            <div class="fr-collapse" id="fr-sidemenu-item-3">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Emissions'])" href="#" target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Empreinte'])" href="#" target="_self">Empreinte</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Biodiversité'])" href="#" target="_self">Biodiversité</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Pollution'])" href="#" target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Energie'])" href="#" target="_self">Energie</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Autre'])" href="#" target="_self">Autre</a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Transports</button>
            <div class="fr-collapse" id="fr-sidemenu-item-4">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Emissions'])" href="#"  target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Sobriété transports'])" href="#"  target="_self">Sobriété transports</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Covoiturage'])" href="#"  target="_self">Covoiturage</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Report Modal Voyageurs'])"  href="#" target="_self">Report Modal Voyageurs</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Electrification VP'])" href="#"  target="_self">Electrification VP</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Efficacité véhicules'])" href="#"  target="_self">Efficacité véhicules</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Autres'])" href="#" target="_self">Autres</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Bus et cars'])" href="#" target="_self">Bus et cars</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Etat exemplaire'])" href="#" target="_self">Etat exemplaire</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Fret'])" href="#" target="_self">Fret</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Aérien'])" href="#" target="_self">Aérien</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Biocarburant'])" href="#" target="_self">Biocarburant</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Pollution'])" href="#"  target="_self">Pollution</a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-5">Batiments</button>
            <div class="fr-collapse" id="fr-sidemenu-item-5">

              <ul class="fr-sidemenu__list">
            <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Emissions'])" href="#"  target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Consommation'])" href="#" target="_self">Consommation</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Gaz'])" href="#" target="_self">Gaz </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Fioul '])" href="#" target="_self">Fioul </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Rénovations résidentielles'])" href="#"  target="_self">Rénovations résidentielles</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Aménagement'])" href="#"  target="_self">Aménagement</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Froid / Adaptation'])" href="#" target="_self">Froid / Adaptation</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Chaleur'])" href="#" target="_self">Chaleur</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Filière'])" href="#" target="_self">Filière</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Etat exemplaire'])" href="#" target="_self">Etat exemplaire</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Pollution'])" href="#" target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Biocarburant'])" href="#" target="_self">Biocarburant</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Pollution'])" href="#"  target="_self">Pollution</a> </li>

              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-6">Energie</button>
            <div class="fr-collapse" id="fr-sidemenu-item-6">

              <ul class="fr-sidemenu__list">
              <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Emissions'])" href="#"  target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','ENR'])" href="#"  target="_self">ENR</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Autre'])" href="#"  target="_self">Autre </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Emplois '])" href="#"  target="_self">Emplois </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Electricité'])" href="#"  target="_self">Electricité</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Eolien'])" href="#" target="_self">Eolien</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Hydroénergie'])" href="#" target="_self">Hydroénergie</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Autres ENR marines'])" href="#" target="_self">Autres ENR marines</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Nucléaire'])" href="#" target="_self">Nucléaire</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Biogaz'])" href="#" target="_self">Biogaz</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Géothermie'])" href="#" target="_self">Géothermie</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Hydrogène'])" href="#"  target="_self">Hydrogène</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Bois'])" href="#"  target="_self">Bois</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Chaleur et froid'])" href="#" target="_self">Chaleur et froid</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Fossiles '])" href="#"  target="_self">Fossiles </a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-7">Industrie</button>
            <div class="fr-collapse" id="fr-sidemenu-item-7">
              <ul class="fr-sidemenu__list">
               <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Industrie','Emissions'])" href="#" target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Industrie','Capture et stockage de carbone'])" href="#" target="_self">Capture et stockage de carbone</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Industrie','Energie'])" href="#"  target="_self">Energie </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Industrie','Pollution '])" href="#" target="_self">Pollution </a></li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-8">Agriculture</button>
            <div class="fr-collapse" id="fr-sidemenu-item-8">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Emissions'])" href="#" target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Consommation'])" href="#" target="_self">Consommation</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Etat exemplaire'])" href="#"  target="_self">Etat exemplaire </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Elevage '])" href="#"  target="_self">Elevage </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Légumineuses'])" href="#"  target="_self">Légumineuses</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Engrais'])" href="#"  target="_self">Engrais</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Autres leviers azotes'])" href="#" target="_self">Autres leviers azotes</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Machines agricoles'])" href="#" target="_self">Machines agricoles</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Energie'])" href="#" target="_self">Energie</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Phytosanitaires'])" href="#" target="_self">Phytosanitaires</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Pollution'])" href="#" target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Autre'])" href="#"  target="_self">Autre</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Aquaculture'])" href="#" target="_self">Aquaculture</a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-9">Eau</button>
            <div class="fr-collapse" id="fr-sidemenu-item-9">

              <ul class="fr-sidemenu__list">
                 <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Ressource disponible'])" href="#" target="_self">Ressource disponible</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Consommation'])" href="#"  target="_self">Consommation</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Réseaux'])" href="#"  target="_self">Réseaux</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Réutilisation '])" href="#"  target="_self">Réutilisation </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Qualité'])" href="#"  target="_self">Qualité</a></li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-10">Ecosystèmes</button>
            <div class="fr-collapse" id="fr-sidemenu-item-10">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Protection'])" href="#"   target="_self">Protection</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Continuité'])" href="#"   target="_self">Continuité</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Aménagement'])" href="#"   target="_self">Aménagement</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Prairies '])"  href="#" target="_self">Prairies </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Forêts'])" href="#" target="_self">Forêts</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Produit bois'])" href="#" target="_self">Produit bois</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Haies'])" href="#" target="_self">Haies</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Mer et littoral'])" href="#" target="_self">Mer et littoral</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Autre'])" href="#" target="_self">Autre</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Phytosanitaires'])" href="#" target="_self">Phytosanitaires</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Pollution'])" href="#" target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Autre'])" href="#"  target="_self">Autre</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Aquaculture'])" href="#" target="_self">Aquaculture</a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-11">Economie circulaire</button>
            <div class="fr-collapse" id="fr-sidemenu-item-11">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Protection'])" href="#"  target="_self">Protection</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Empreinte'])" href="#"  target="_self">Empreinte</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Sobriété déchets'])"  href="#" target="_self">Sobriété déchets</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Captage de méthane dans les ISDND '])" href="#"  target="_self">Captage de méthane dans les ISDND </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Valorisation des déchets'])" href="#"  target="_self">Valorisation des déchets</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Etat exemplaire'])"  href="#" target="_self">Etat exemplaire</a></li>

              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>

export default {
  name: 'SideNavigation',
  methods: {
    emitSelection(selectedValue) {
      // Émettre un événement personnalisé avec l'information de sélection
      this.$emit('selectionChanged', selectedValue);
    }
  }
}
</script>

<style>

</style>
  