<template>
  <nav class="fr-sidemenu fr-sidemenu--sticky-full-height fr-sidemenu__padding" role="navigation" aria-labelledby="fr-sidemenu-title">
      <SideNavigation/>
  </nav>
</template>

<script>

import SideNavigation from './SideNavigation.vue'

export default {
  name: 'SideBar',
  components:{
    SideNavigation
  }
}
</script>

<style scoped lang="scss">
$top: 2.25rem;

@media (max-width: 62em) {
  .fr-sidemenu {
    left: 0;
    margin: 0;
    position: fixed;
    top: $top;
    width: 100%;
    z-index: 5000;

    &.displayed {
      display: flex !important;
    }

    &::before {
      content: "";
      background-color: rgba(22, 22, 22, 0.64);
      height: 100%;
      left: 0;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: -1;
    }
  }
}

.fr-sidemenu__padding {
  padding-right: 0rem !important;
}
</style>
