
<template>
  <div>
    <header-dsfr></header-dsfr>
    <div class="fr-container">
      <div id="app">
        <!-- Bloc de navigation -->
        <!-- <div id="nav">
          <router-link :to="{ name: 'visits' }">Visite</router-link> |
          <router-link :to="{ name: 'sites' }">Sites</router-link>
          <br>
          <br>
          <button @click="$keycloak.logoutFn" v-if="$keycloak.authenticated">Log out</button>
        </div> -->
        <router-view />
      </div>
      

    </div>

    <!-- <upfooter></upfooter> -->
    <footer-dsfr></footer-dsfr>
  </div>
    <!-- <upfooter></upfooter> -->
    
</template>

<script>


</script>

<style>

.container{
  background-color: #f6f6f6;
}

.fr-container{
  width: 100%;
}
body{
  background-color: white;
}

.flex-container {
  max-width: none;
  overflow: hidden;
}
</style>
