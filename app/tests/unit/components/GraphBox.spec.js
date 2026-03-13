import { shallowMount } from "@vue/test-utils";
import GraphBox from "@/components/GraphBox.vue";

const BarChartStub = {
  name: "BarChart",
  props: ["x", "y", "name", "pointopacity", "trendline", "targetTrajectory", "target-trajectory"],
  template: '<div class="bar-chart-stub"></div>',
};

const MultiLineChartStub = {
  name: "MultiLineChart",
  props: ["x", "y", "name", "pointopacity"],
  template: '<div class="multi-line-chart-stub"></div>',
};

function mountGraphBox(dataObj) {
  return shallowMount(GraphBox, {
    propsData: {
      idAccordion: "graph-box-test",
      dataObj,
    },
    data() {
      return {
        displayChart: true,
      };
    },
    stubs: {
      BarChart: BarChartStub,
      MultiLineChart: MultiLineChartStub,
      SegmentedControls: true,
      tagsCard: true,
      TableComponent: true,
      TableComponentVariant: true,
      LineChart: true,
    },
  });
}

describe("GraphBox", () => {
  it("renders compact layout landmarks for chantier detail cards", () => {
    const wrapper = shallowMount(GraphBox, {
      propsData: {
        idAccordion: "graph-box-test",
        compact: true,
        dataObj: {
          label_indic: "Production d'électricité décarbonée",
          label_unit: "TWh",
          label_sous_groupe: "",
          label_sources: "RTE",
          date_maj: "2026-03-01",
          values: {
            legend: ["Historique"],
            x: [["2020"]],
            y: [[42]],
            ytab: [42],
          },
        },
      },
    });

    expect(wrapper.classes()).toContain("graph-box-card");
    expect(wrapper.classes()).toContain("graph-box-card--compact");
    expect(wrapper.find(".graph-box-header").exists()).toBe(true);
    expect(wrapper.find(".graph-box-controls").exists()).toBe(true);
    expect(wrapper.find(".graph-box-resources").exists()).toBe(true);
    expect(wrapper.text()).toContain("Télécharger les données");
    expect(wrapper.find("#graph-box-test-download").exists()).toBe(true);
  });

  it("keeps the default shared card presentation when compact mode is not requested", () => {
    const wrapper = shallowMount(GraphBox, {
      propsData: {
        idAccordion: "graph-box-default",
        dataObj: {
          label_indic: "Production d'électricité décarbonée",
          label_unit: "TWh",
          label_sous_groupe: "",
          label_sources: "RTE",
          date_maj: "2026-03-01",
          values: {
            legend: ["Historique"],
            x: [["2020"]],
            y: [[42]],
            ytab: [42],
          },
        },
      },
    });

    expect(wrapper.classes()).not.toContain("graph-box-card--compact");
  });

  it("does not mutate the input indicator object when formatting the update date", () => {
    const dataObj = {
      label_indic: "Production d'électricité décarbonée",
      label_unit: "TWh",
      label_sous_groupe: "",
      label_sources: "RTE",
      date_maj: "2026-03-01 08:30am",
      values: {
        legend: ["Historique"],
        x: [["2020"]],
        y: [[42]],
        ytab: [42],
      },
    };

    const wrapper = shallowMount(GraphBox, {
      propsData: {
        idAccordion: "graph-box-date",
        dataObj,
      },
    });

    expect(dataObj.date_maj).toBe("2026-03-01 08:30am");
    expect(wrapper.text()).toContain("2026-03-01");
  });

  it("passes a single total trendline and lighter target opacity for stacked bars", () => {
    const wrapper = mountGraphBox({
      label_indic: "Emissions par sous-groupe",
      label_unit: "ktCO2e",
      label_sous_groupe: ["Scope 1", "Scope 2"],
      label_sources: "Test",
      date_maj: "2026-03-01",
      type_de_graphique: "Barres empilées",
      label_value: ["2019", "2020", "2021", "2022", "cible"],
      date: [["2019", "2020", "2021", "2022", "2030"]],
      values: [
        [50, 15, 20, 25, 30],
        [50, 15, 20, 25, 40],
      ],
    });

    const barChart = wrapper.findComponent(BarChartStub);

    expect(barChart.exists()).toBe(true);
    expect(JSON.parse(barChart.props("pointopacity"))).toEqual([
      [1, 1, 1, 1, 0.6],
      [1, 1, 1, 1, 0.6],
    ]);
    expect(JSON.parse(barChart.props("trendline"))).toEqual([null, 30, 40, 50, 130]);
    expect(
      JSON.parse(barChart.props("target-trajectory") || barChart.props("targetTrajectory"))
    ).toEqual({
      points: [
        { year: "2022", value: 50, isTarget: false },
        { year: "2030", value: 70, isTarget: true },
      ],
    });
  });

  it("ignores empty future years when building stacked total lines", () => {
    const wrapper = mountGraphBox({
      label_indic: "Puissance de production d'électricité renouvelable installée",
      label_unit: "GW",
      label_sous_groupe: ["Eolien terrestre", "Photovoltaïque"],
      label_sources: "Test",
      date_maj: "2026-03-01",
      type_de_graphique: "Barres empilées",
      reference_year_for_target_trajectory: "2023",
      label_value: ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      date: [["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"]],
      values: [
        [10, 12, 14, 16, 18, 20, 20, 25, 30, null, null, null, null, 40],
        [8, 9, 10, 12, 14, 17, 25, 25, 25, null, null, null, null, 30],
      ],
    });

    const barChart = wrapper.findComponent(BarChartStub);

    expect(barChart.exists()).toBe(true);
    expect(JSON.parse(barChart.props("trendline"))).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
      45,
      50,
      55,
      60,
      65,
      70,
      75,
      80,
    ]);
    expect(
      JSON.parse(barChart.props("target-trajectory") || barChart.props("targetTrajectory"))
    ).toEqual({
      points: [
        { year: "2023", value: 45, isTarget: false },
        { year: "2030", value: 70, isTarget: true },
      ],
    });
  });

  it("marks target years as lighter points for independent lines so the ending segment can be dashed", () => {
    const wrapper = mountGraphBox({
      label_indic: "Emissions par sous-groupe",
      label_unit: "ktCO2e",
      label_sous_groupe: ["Scope 1", "Scope 2"],
      label_sources: "Test",
      date_maj: "2026-03-01",
      type_de_graphique: "Courbes indépendantes",
      label_value: ["2020", "2021", "2022", "cible"],
      date: [["2020", "2021", "2022", "2030"]],
      values: [
        [10, 15, 20, 25],
        [20, 25, 30, 40],
      ],
    });

    const lineChart = wrapper.findComponent(MultiLineChartStub);

    expect(lineChart.exists()).toBe(true);
    expect(JSON.parse(lineChart.props("pointopacity"))).toEqual([
      [1, 1, 1, 0.6],
      [1, 1, 1, 0.6],
    ]);
  });
});
