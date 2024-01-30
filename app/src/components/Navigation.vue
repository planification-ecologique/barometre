<template>
  <!-- Liens directs uniquement -->
  <div class="cursor_pointer">
  <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
      <ul class="fr-nav__list">
        <li class="fr-nav__item" @click=router_to_visits()>
            <a class="fr-nav__link" style="color: rgb(59, 58, 58);" target="_self" :aria-current=currentVisits>Tableau de bord </a>
        </li>
        <li class="fr-nav__item" @click=router_to_sites()>
            <a class="fr-nav__link" style="color: rgb(59, 58, 58);" target="_self" :aria-current=currentSites>Thématiques</a>
        </li>
      </ul>
  </nav>
  </div>
</template>

<script> 
  import router from '../router'
  export default {
    name: 'navigation-dsfr',
    data () {
      return {
        currentSites: false,
        currentVisits: false,
        myrouter: router
      }
    },
    methods: {
      router_to_visits () {
        this.myrouter.push({ name: 'visits' })
        this.currentSites= false
        this.currentVisits= true
        if (this.get_name_page() == "visites"){
          window.location.reload();
        }
      },
      router_to_sites () {
        this.myrouter.push({ name: 'sites' })
        this.currentSites= true
        this.currentVisits= false
      },
      get_name_page(){
        let location = window.location.href
        var page = location.split('/')
        page = page[page.length-1]
        return page
      }
    },
    mounted () {
      this.get_name_page() == "sites" ? this.currentSites= true : this.currentVisits= true
    }
  }
  

</script>

<style>

a:hover:not([href]) {
  cursor : pointer;/*default;*/
}
.cursor_pointer {
  cursor : pointer;
}
</style>
