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
        <br>
        <router-view />
      </div>

    </div>
    <footer-dsfr></footer-dsfr>
  </div>
</template>

<style>
body {
  background-color: white;
}
</style>
