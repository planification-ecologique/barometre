<template>
  <div class="fr-skiplinks">
    <nav class="fr-container" role="navigation" aria-label="Accès rapide">
      <ul class="fr-skiplinks__list">
        <li v-for="option in menuOptions">
          <a :id="'fr-skip-link-'+ option.value" class="fr-link" :href=option.link>
            {{ option.label }}
          </a >
        </li>        
      </ul>
      </nav>
  </div>
</template>
  
<script>
  export default {
    name: "SkipLinksDsfr",
    data(){
      return {
        menuOptions: [
          { value:"content", label: 'Contenu', link: "#content" },
          { value:"header-navigation", label: 'Menu', link: "#header-navigation" },
          { value:"footer", label: 'Pied de page', link: "#footer" }
        ]
      }
    }
  }
</script>
  