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
    get_tags() {
      this.tags = [
        {
          value: "atténuation",
          label: "Atténuation",
          selected: true
        },
        // {value:'emissions', label:'Emissions', selected:false},
        {
          value: "biodiversité",
          label: "Biodiversité",
          selected: false
        },
        {
          value: "ressources",
          label: "Ressources",
          selected: false
        },
        {
          name: "adaptation",
          value: "adaptation",
          label: "Adaptation",
          selected: false
        },
        {          
          value: "santé",
          label: "Santé",
          selected: false
        }
      ];
    }
  },
  mounted() {
    this.get_tags();
  },
};
</script>

<style></style>
