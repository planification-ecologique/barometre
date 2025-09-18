<template>
  <div class="fr-tags-group">
    <button
      type="submit"
      v-for="tag in tags"
      class="fr-tag"
      :aria-pressed="tag.selected"
      :value="tag.value"
      :id="'fr-button-tag-' + tag.value"
      v-on:click="selectTag(tag.value, tag)"
      :title="tag.label"
    >
      {{ tag.label }}
    </button>
  </div>
</template>

<script>

import { getAllUniqueTags } from "@/services/csvDataService.js";

export default {
  name: "Tags",
  props: {
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tags: [],
    };
  },
  methods: {
    get_selected_tags() {
      return this.tags
        .filter((item) => item.selected === true)
        .map((item) => item.value);
    },
    changerGuillemets(ls_tags) {
      // Utiliser map pour parcourir la liste et changer les guillemets
      var tags_res = ls_tags.map((element) => {
        // Utiliser JSON.stringify pour entourer l'élément de guillemets doubles
        return element.replace(/'/g, '"');
      });
      return tags_res;
    },
    selectTag(tagValue, selectedTag) {
      if (selectedTag.selected === true) {
        selectedTag.selected = false;
      } else {
        selectedTag.selected = true;
      }
      var selected_tags = this.changerGuillemets(this.get_selected_tags());
      this.$emit("tags-selected", selected_tags);
    },
    // Récupération des tags uniques via CSV data service
    async fetch_unique_tags() {
      try {
        const response = await getAllUniqueTags(this.useStaging ? 'staging' : 'production');

        if (!response) {
          throw new Error("Erreur lors de la récupération des tags.");
        }

        // Récupération des données
        let results = response.data.results;

        // Formatage pour les composants tags
        this.tags = results.map((item) => {
          return {
            value: item,
            label: item[0].toUpperCase() + item.slice(1),
            selected: false,
          };
        });
      } catch (error) {
        console.error("Erreur dans le chargement des tags : ", error);
      }
    }
  },
  mounted() {
    this.fetch_unique_tags();
  },
};
</script>

<style></style>
