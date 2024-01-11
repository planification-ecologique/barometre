<template>
 
  <nav class="fr-sidemenu fr-col-3" role="navigation" aria-labelledby="fr-sidemenu-title">
    <div class="fr-sidemenu__inner"> <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper"
        aria-expanded="false"> Dans cette rubrique </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <div class="fr-sidemenu__title" id="fr-sidemenu-title">Introduction</div>
        <ul class="fr-sidemenu__list">


          <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Vue d'ensemble</a> </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-3"> Transverse </button>
            <div class="fr-collapse" id="fr-sidemenu-item-3">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Sobriété</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Covoiturage</a> </li>

              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Transports</button>
            <div class="fr-collapse" id="fr-sidemenu-item-4">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Empreintes</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Biodiversité</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Pollution</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Energie</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Rep.mod.voy</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Elec.particuliers</a>
                </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Efficacité véhic</a>
                </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Bus et cars</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Fret</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Aérien</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Biocarburant</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Autres</a> </li>


              </ul>
            </div>
          </li>
          <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Batiments</a> </li>

          <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Energie</a> </li>
          <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Industrie</a> </li>
          <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Agriculture</a> </li>
          <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Eau</a> </li>
          <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Ecosystèmes</a> </li>
          <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Economie circulaire</a>
          </li>


        </ul>
      </div>
    </div>
  </nav>
</template>
  
<script>

export default {
  name: 'SideNavigation',
}
</script>
  