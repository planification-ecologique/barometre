<template>
  <div
    v-if="enabled && nextLabel"
    class="section-next-bar"
    role="region"
    aria-label="Navigation vers la section suivante"
  >
    <button
      type="button"
      class="fr-btn fr-btn--secondary section-next-bar__btn"
      :aria-label="`Passer à la section suivante : ${nextLabel}`"
      @click="onClickNext"
    >
      <span class="section-next-bar__text">
        <span class="section-next-bar__prefix">Section suivante</span>
        <span class="section-next-bar__name">{{ nextLabel }}</span>
      </span>
    </button>
    <div ref="scrollSentinel" class="section-next-bar__sentinel" aria-hidden="true" />
  </div>
</template>

<script>
export default {
  name: 'SectionNextBar',
  props: {
    enabled: {
      type: Boolean,
      default: false,
    },
    nextLabel: {
      type: String,
      default: '',
    },
    /** Déclenche la navigation lorsque le bas de la fenêtre atteint la zone du bouton */
    advanceOnBottomScroll: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      scrollArmed: true,
      userHasScrolled: false,
      io: null,
      onFirstScroll: null,
    };
  },
  watch: {
    enabled(val) {
      if (val) this.scrollArmed = true;
    },
    nextLabel() {
      this.scrollArmed = true;
    },
  },
  mounted() {
    this.onFirstScroll = () => {
      this.userHasScrolled = true;
    };
    window.addEventListener('scroll', this.onFirstScroll, { passive: true, once: true });
    if (!this.advanceOnBottomScroll || typeof IntersectionObserver === 'undefined') return;
    this.io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit || !this.enabled || !this.nextLabel || !this.scrollArmed) return;
        if (!this.userHasScrolled) return;
        const doc = document.documentElement;
        if (doc.scrollHeight <= window.innerHeight + 64) return;
        this.scrollArmed = false;
        this.$emit('go-next');
      },
      {
        root: null,
        rootMargin: '0px 0px 120px 0px',
        threshold: 0,
      }
    );
    this.$nextTick(() => {
      const el = this.$refs.scrollSentinel;
      if (this.io && el) this.io.observe(el);
    });
  },
  beforeDestroy() {
    if (this.onFirstScroll) {
      window.removeEventListener('scroll', this.onFirstScroll);
      this.onFirstScroll = null;
    }
    if (this.io) {
      this.io.disconnect();
      this.io = null;
    }
  },
  methods: {
    onClickNext() {
      this.$emit('go-next');
    },
  },
};
</script>

<style scoped lang="scss">
.section-next-bar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-default-grey, #e5e5e5);
}

.section-next-bar__btn {
  justify-content: center;
  width: 100%;
  max-width: 100%;
}

.section-next-bar__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.125rem;
}

.section-next-bar__prefix {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.85;
}

.section-next-bar__name {
  font-size: 1rem;
  font-weight: 700;
}

/* Zone détectée quand l’utilisateur a fait défiler jusqu’en bas de page */
.section-next-bar__sentinel {
  height: 1px;
  width: 100%;
  pointer-events: none;
  margin-top: -1px;
}
</style>
