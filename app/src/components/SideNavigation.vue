<template>
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
              href="#"
              target="_self"
              aria-current="page"
              >Vue d'ensemble</a>
          </li>          
        <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-3"> Transverse </button>
            <div class="fr-collapse" id="fr-sidemenu-item-3">

              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Emissions</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Sobriété</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Covoiturage</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Report modalité voyageurs</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Electricité particuliers</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Efficacité véhicules</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Bus et cars</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Etat exemplaire</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Fret</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Aérien</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Biocarburants</a> </li>
                <li class="fr-sidemenu__item"> <a class="fr-sidemenu__link" href="#" target="_self">Pollution</a> </li>

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
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Batiments</button>
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
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Energie</button>
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
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Industrie</button>
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
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Agriculture</button>
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
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Eau</button>
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
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Ecosystèmes</button>
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
          <li class="fr-sidemenu__item"> <button class="fr-sidemenu__btn" aria-expanded="false"
              aria-controls="fr-sidemenu-item-4">Economie circulaire</button>
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
        </ul>
      </div>
    </div>
</template>
  
<script>

export default {
  name: 'SideNavigation',
}
</script>

<style>

</style>
  