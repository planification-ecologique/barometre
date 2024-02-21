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
              target="_self"
              >Vue d'ensemble</a>
          </li>          
        <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-3"> Transverse </button>
            <div class="fr-collapse" id="fr-sidemenu-item-3">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item" v-for="option in menuOptions"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse',option.value])"  target="_self">{{ option.label }}</a> </li>
                <!-- <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Empreinte'])"  target="_self">Empreinte</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Biodiversité'])"  target="_self">Biodiversité</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Pollution'])"  target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Energie'])"  target="_self">Energie</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transverse','Autre'])"  target="_self">Autre</a> </li> -->
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Transports</button>
            <div class="fr-collapse" id="fr-sidemenu-item-4">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Emissions'])"   target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Sobriété transports'])"   target="_self">Sobriété transports</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Covoiturage'])"   target="_self">Covoiturage</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Report Modal Voyageurs'])"   target="_self">Report Modal Voyageurs</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Electrification VP'])"   target="_self">Electrification VP</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Efficacité véhicules'])"   target="_self">Efficacité véhicules</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Autres'])"  target="_self">Autres</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Bus et cars'])"  target="_self">Bus et cars</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Etat exemplaire'])"  target="_self">Etat exemplaire</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Fret'])"  target="_self">Fret</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Aérien'])"  target="_self">Aérien</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Biocarburant'])"  target="_self">Biocarburant</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Transport','Pollution'])"   target="_self">Pollution</a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-5">Batiments</button>
            <div class="fr-collapse" id="fr-sidemenu-item-5">

              <ul class="fr-sidemenu__list">
            <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Emissions'])"   target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Consommation'])"  target="_self">Consommation</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Gaz'])"  target="_self">Gaz </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Fioul '])"  target="_self">Fioul </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Rénovations résidentielles'])"   target="_self">Rénovations résidentielles</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Aménagement'])"   target="_self">Aménagement</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Froid / Adaptation'])"  target="_self">Froid / Adaptation</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Chaleur'])"  target="_self">Chaleur</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Filière'])"  target="_self">Filière</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Etat exemplaire'])"  target="_self">Etat exemplaire</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Pollution'])"  target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Biocarburant'])"  target="_self">Biocarburant</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Batiments','Pollution'])"   target="_self">Pollution</a> </li>

              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-6">Energie</button>
            <div class="fr-collapse" id="fr-sidemenu-item-6">

              <ul class="fr-sidemenu__list">
              <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Emissions'])"   target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','ENR'])"   target="_self">ENR</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Autre'])"   target="_self">Autre </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Emplois '])"   target="_self">Emplois </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Electricité'])"   target="_self">Electricité</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Eolien'])"  target="_self">Eolien</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Hydroénergie'])"  target="_self">Hydroénergie</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Autres ENR marines'])"  target="_self">Autres ENR marines</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Nucléaire'])"  target="_self">Nucléaire</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Biogaz'])"  target="_self">Biogaz</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Géothermie'])"  target="_self">Géothermie</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Hydrogène'])"   target="_self">Hydrogène</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Bois'])"   target="_self">Bois</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Chaleur et froid'])"  target="_self">Chaleur et froid</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Energie','Fossiles '])"   target="_self">Fossiles </a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-7">Industrie</button>
            <div class="fr-collapse" id="fr-sidemenu-item-7">
              <ul class="fr-sidemenu__list">
               <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Industrie','Emissions'])"  target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Industrie','Capture et stockage de carbone'])"  target="_self">Capture et stockage de carbone</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Industrie','Energie'])"   target="_self">Energie </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Industrie','Pollution '])"  target="_self">Pollution </a></li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-8">Agriculture</button>
            <div class="fr-collapse" id="fr-sidemenu-item-8">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Emissions'])"  target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Consommation'])"  target="_self">Consommation</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Etat exemplaire'])"   target="_self">Etat exemplaire </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Elevage '])"   target="_self">Elevage </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Légumineuses'])"   target="_self">Légumineuses</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Engrais'])"   target="_self">Engrais</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Autres leviers azotes'])"  target="_self">Autres leviers azotes</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Machines agricoles'])"  target="_self">Machines agricoles</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Energie'])"  target="_self">Energie</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Phytosanitaires'])"  target="_self">Phytosanitaires</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Pollution'])"  target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Autre'])"   target="_self">Autre</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Agriculture','Aquaculture'])"  target="_self">Aquaculture</a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-9">Eau</button>
            <div class="fr-collapse" id="fr-sidemenu-item-9">

              <ul class="fr-sidemenu__list">
                 <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Ressource disponible'])"  target="_self">Ressource disponible</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Consommation'])"   target="_self">Consommation</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Réseaux'])"   target="_self">Réseaux</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Réutilisation '])"   target="_self">Réutilisation </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Eau','Qualité'])"   target="_self">Qualité</a></li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-10">Ecosystèmes</button>
            <div class="fr-collapse" id="fr-sidemenu-item-10">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Protection'])"    target="_self">Protection</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Continuité'])"    target="_self">Continuité</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Aménagement'])"    target="_self">Aménagement</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Prairies '])"   target="_self">Prairies </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Forêts'])"  target="_self">Forêts</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Produit bois'])"  target="_self">Produit bois</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Haies'])"  target="_self">Haies</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Mer et littoral'])"  target="_self">Mer et littoral</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Autre'])"  target="_self">Autre</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Phytosanitaires'])"  target="_self">Phytosanitaires</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Pollution'])"  target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Autre'])"   target="_self">Autre</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Aquaculture'])"  target="_self">Aquaculture</a> </li>
              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-11">Economie circulaire</button>
            <div class="fr-collapse" id="fr-sidemenu-item-11">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Protection'])"   target="_self">Protection</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Empreinte'])"   target="_self">Empreinte</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Sobriété déchets'])"   target="_self">Sobriété déchets</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Captage de méthane dans les ISDND '])"   target="_self">Captage de méthane dans les ISDND </a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Valorisation des déchets'])"   target="_self">Valorisation des déchets</a></li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" @click="emitSelection(['Ecosystèmes','Etat exemplaire'])"   target="_self">Etat exemplaire</a></li>

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
  data() {
    return {
      menuOptions: []
    }

  },
  methods: {
    get_menu_options() {
      this.menuOptions = [
        { value: 'Emissions / Puits', label: 'Emissions', selected: false },
        { value: 'Empreinte', label: 'Empreinte', selected: false },
        { value: 'Biodiversité', label: 'Biodiversité', selected: false },
        { value: 'Pollution', label: 'Pollution', selected: false },
        { value: 'Energie', label: 'Energie', selected: false },
        { value: 'Autre', label: 'Autre', selected: false }
      ]
    },
    emitSelection(selectedValue) {
      // Émettre un événement personnalisé avec l'information de sélection
      this.$emit('selectionChanged', selectedValue);
    }
  },
  mounted() {
    this.get_menu_options()
  }
}
</script>

<style>
  a:hover:not([href]) {
    cursor: pointer;
    background-color: #f6f6f6;    
  }
</style>
  