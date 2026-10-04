import { regionSelection } from "@/services/regionSelection";

/** Shared territory label for synthesis tables (chantiers and état). */
export default {
  data() {
    return {
      regionalByIndicator: {},
    };
  },
  computed: {
    sharedRegionCode() {
      return regionSelection.code;
    },
  },
  methods: {
    indicatorKey(indicator) {
      return String(indicator?.id || indicator?.label || "");
    },
    setRegionalPresentation(indicator, presentation) {
      const key = this.indicatorKey(indicator);
      if (!key) return;
      if (presentation) this.$set(this.regionalByIndicator, key, presentation);
      else if (this.regionalByIndicator[key]) this.$delete(this.regionalByIndicator, key);
    },
    presentationFor(indicator) {
      if (!this.sharedRegionCode) return null;
      return this.regionalByIndicator[this.indicatorKey(indicator)] || null;
    },
    indicatorTitle(indicator) {
      return this.presentationFor(indicator)?.label || indicator.label;
    },
    indicatorUnit(indicator) {
      const presentation = this.presentationFor(indicator);
      if (presentation) return presentation.unit || "";
      return indicator.labelUnit || "";
    },
    indicatorSource(indicator) {
      const presentation = this.presentationFor(indicator);
      if (presentation) return presentation.source || "";
      return indicator.rawData?.label_sources || "";
    },
    indicatorSourceUrl(indicator) {
      if (this.presentationFor(indicator)) return "";
      return this.sourceUrl(indicator.rawData);
    },
    indicatorLegend(indicator) {
      const presentation = this.presentationFor(indicator);
      if (presentation) return presentation.legendItems || [];
      return indicator.legendItems || [];
    },
  },
};
