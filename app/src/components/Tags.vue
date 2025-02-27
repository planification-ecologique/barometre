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
import { api } from "@/services/api.js";

export default {
  name: "Tags",
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
    // Récupération des tags uniques via l'API
    async fetch_unique_tags() {
          // Appel à l'API
          try {
            const response = await api("/crud/get_all_unique_tags", {
              method: "GET",
            });

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
            
            // console.log("results_API--------", JSON.stringify(this.results_API));
          } catch (error) {
            console.error("Erreur dans le chargement des tags : ", error);
          }
        },

    // get_tags() {
    //   this.tags = [
    //     {
    //       value: "atténuation",
    //       label: "Atténuation",
    //       selected: false
    //     },
    //     // {value:'emissions', label:'Emissions', selected:false},
    //     {
    //       value: "biodiversité",
    //       label: "Biodiversité",
    //       selected: false
    //     },
    //     {
    //       value: "ressources",
    //       label: "Ressources",
    //       selected: false
    //     },
    //     {
    //       name: "adaptation",
    //       value: "adaptation",
    //       label: "Adaptation",
    //       selected: false
    //     },
    //     {          
    //       value: "santé",
    //       label: "Santé",
    //       selected: false
    //     }
    //   ];
    // }
  },
  mounted() {
    // this.get_tags();
    this.fetch_unique_tags();
  },
};
</script>

<style></style>
