<template>
  <nav role="navigation" class="fr-pagination" aria-label="Pagination">
    <ul class="fr-pagination__list">
      <li>
        <a
          class="fr-pagination__link fr-pagination__link--first"
          role="link"
          href="#"
          @click="firstPage()"
          title="Pemière page"
          id="first-page"
        >
          Première page
        </a>
      </li>
      <li>
        <a
          class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
          role="link"
          href="#"
          @click="prevPage()"
          title="Page précédente"
          id="previous-page"
        >
          Page précédente
        </a>
      </li>

      <li v-for="page in pages">
        <a
          class="fr-pagination__link fr-displayed-lg"
          :aria-current="page.selected"
          @click="changePage(page.id)"
          href="#"
          :title="'Page ' + page.label"
          :id="'page'+page.id"
        >
          {{ page.label }}
        </a>
      </li>

      <li>
        <a
          class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
          href="#"
          @click="nextPage()"
          title="Page suivante"
          id="next-page"
        >
          Page suivante
        </a>
      </li>

      <li>
        <a
          class="fr-pagination__link fr-pagination__link--last"
          href="#"
          @click="lastPage()"
          title="Dernière page"
          id="last-page"
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
      var end = Math.max(
        Math.min(select + this.bound, this.nbPages),
        this.length_pages
      );

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
      if (nb_item > 1) {
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

<style></style>
