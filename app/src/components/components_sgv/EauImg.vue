<template>
  <div class="fr-card__img">
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
  >
  <g stroke="#000091" stroke-width="2" fill="none">
    <path d="M32 8C32 8 16 28 16 40C16 49.9411 23.0589 57 32 57C40.9411 57 48 49.9411 48 40C48 28 32 8 32 8Z"/>
    <path d="M24 40C24 44.4183 27.5817 48 32 48C36.4183 48 40 44.4183 40 40" stroke="#E1000F"/>
  </g>
</svg>

    <!-- L’alternative de l’image (attribut alt) doit toujours être présente, sa valeur peut-être vide (image n’apportant pas de sens supplémentaire au contexte) ou non (porteuse de texte ou apportant du sens) selon votre contexte -->
  </div>
</template>

<script>
export default {
  name: "EauImg",
  props: {
    width: {
      type: String,
      default: "200px", // Valeur par défaut
    },
    height: {
      type: String,
      default: "200px", // Valeur par défaut
    },
  },
};
</script>

<style scoped>
.right-image {
  order: 2;
  display: flex;
}
.fr-artwork-decorative {
  fill: #ececff;
}
.fr-artwork-minor {
  fill: #e1000f;
}
.fr-artwork-major {
  fill: #000091;
}
</style>
