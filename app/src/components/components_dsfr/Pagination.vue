<template>
  <nav v-if="nbPages > 1" role="navigation" class="fr-pagination" aria-label="Pagination">
    <ul class="fr-pagination__list">
      <li v-if="nbPages > 5">
        <a
          id="fr-pagination-link-first"
          class="fr-pagination__link fr-pagination__link--first"
          role="link"
          href="#"
          @click="firstPage()"
          title="Première page"
        >
          Première page
        </a>
      </li>
      <li v-if="nbPages > 5">
        <a
          id="fr-pagination-link-prev"
          class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
          role="link"
          href="#"
          @click="prevPage()"
          title="Page précédente"
        >
          Page précédente
        </a>
      </li>

      <li v-for="page in pages" :key="page.id">
        <a
          v-if="page.id !== 0 && page.id !== 9999"
          class="fr-pagination__link fr-displayed-lg"
          :aria-current="page.selected"
          @click="changePage(page.id)"
          href="#"
          :title="'Page ' + page.label"
          :id="'fr-pagination-link'+page.id"
        >
          {{ page.label }}
        </a>
        <span
          v-else
          class="fr-pagination__link fr-pagination__link--ellipsis fr-displayed-lg"
          :id="'fr-pagination-link'+page.id"
          aria-hidden="true"
        >
          {{ page.label }}
        </span>
      </li>

      <li v-if="nbPages > 5">
        <a
          id="fr-pagination-link-next"
          class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
          href="#"
          @click="nextPage()"
          title="Page suivante"
        >
          Page suivante
        </a>
      </li>

      <li v-if="nbPages > 5">
        <a
          id="fr-pagination-link-last"
          class="fr-pagination__link fr-pagination__link--last"
          href="#"
          @click="lastPage()"
          title="Dernière page"
        >
          Dernière page
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: "Pagination",
  props: {
    nbPages: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      pages: [],
      pre_selected: 0,
      bound: 2,
      length_pages: 5,
    };
  },
  methods: {
    changePage(select) {
      if (select === 0 || select == 9999) return;

      this.pages = [];
      var start = Math.max(
        Math.min(select - this.bound, this.nbPages - this.length_pages),
        1
      );
      var end = Math.min(select + this.bound, this.nbPages);

      // Ensure we don't show more than length_pages when near the end
      if (end - start + 1 > this.length_pages) {
        start = Math.max(1, end - this.length_pages + 1);
      }

      if (start > 1) {
        this.pages.push({ label: "...", id: 0, selected: false });
      }

      for (var i = start; i <= end; i++) {
        i === select
          ? this.pages.push({ label: i, id: i, selected: true })
          : this.pages.push({ label: i, id: i, selected: false });
      }

      if (end < this.nbPages) {
        this.pages.push({ label: "...", id: 9999, selected: false });
        this.pages.push({
          label: this.nbPages,
          id: this.nbPages,
          selected: false,
        });
      }

      this.$emit("selectedPage", select);
      this.pre_selected = select;
    },
    firstPage() {
      if (this.pre_selected > 1) {
        this.changePage(1);
      }
    },
    prevPage() {
      var nb_item = this.pre_selected - 1;
      if (nb_item >= 1) {
        this.changePage(nb_item);
      }
    },
    nextPage() {
      var nb_item = this.pre_selected + 1;
      if (nb_item <= this.nbPages) {
        this.changePage(nb_item);
      }
    },
    lastPage() {
      if (this.pre_selected < this.nbPages) {
        this.changePage(this.nbPages);
      }
    },
  },
  mounted() {
    this.changePage(1);
  },
};
</script>

<style scoped>
.fr-pagination__link--ellipsis {
  cursor: default;
  pointer-events: none;
}
</style>
