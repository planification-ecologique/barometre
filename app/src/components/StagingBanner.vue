<template>
  <div class="staging-banner" v-if="isStaging">
    <strong>STAGING DATA</strong> - Testez le rendu des graphiques à partir du Grist de test
    <div class="staging-links">
      <router-link to="/staging/dashboard" class="staging-link">Tableau de bord</router-link>
      <router-link to="/staging/search" class="staging-link">Recherche</router-link>
      <a :href="gristDocUrl" target="_blank" class="staging-link">Grist Data</a>
      <a href="#" class="exit-link" @click.prevent="handleExitStaging" style="cursor: pointer;">Quitter Staging</a>
    </div>
  </div>
</template>

<script>
import { GRIST_URLS, clearCSVCache } from '@/services/csvDataService';

export default {
  name: 'StagingBanner',
  computed: {
    isStaging() {
      return this.$route.path.includes('/staging');
    },
    exitPath() {
      // Get the same path without /staging prefix
      const currentPath = this.$route.path;
      return currentPath.replace('/staging', '') || '/';
    },
    gristDocUrl() {
      return GRIST_URLS.stagingEditPage;
    }
  },
  methods: {
    handleExitStaging() {
      clearCSVCache();
      this.$router.push(this.exitPath).then(() => {
        // Force a page reload to ensure fresh data is loaded
        window.location.reload();
      });
    },
  },
  watch: {
    isStaging: {
      immediate: true,
      handler(val) {
        if (val) {
          document.body.classList.add('has-staging-banner');
        } else {
          document.body.classList.remove('has-staging-banner');
        }
      }
    }
  }
}
</script>

<style>
.staging-banner {
  background-color: #ff6b6b;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.staging-links {
  margin-top: 5px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.staging-link, .exit-link {
  color: white;
  text-decoration: underline;
  font-weight: bold;
}

.exit-link {
  color: #ffff00;
}

.staging-link:hover, .exit-link:hover {
  opacity: 0.8;
}

.doc-id-form {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style> 