import { shallowMount } from "@vue/test-utils";
import MiniChart from "@/components/MiniChart.vue";
import { regionSelection } from "@/services/regionSelection";
import { loadAllRegionsDataForIndicator } from "@/services/ecolabApiService";

jest.mock("@/services/ecolabApiService", () => ({
  loadAllRegionsDataForIndicator: jest.fn(),
}));

const BarChartStub = {
  name: "BarChart",
  props: ["x", "y"],
  template: '<div class="bar-chart-stub"></div>',
};

function nationalIndicator() {
  return {
    label_indic: "Part régionale",
    label_unit: "%",
    type_de_graphique: "Barres simple",
    irpe_ids: ["685"],
    values: {
      legend: ["Historique"],
      x: [["2020"]],
      y: [[4]],
    },
  };
}

function bretagnePayload() {
  return {
    cubeName: "cube",
    measureName: "cube.id_685",
    timeDimension: "cube.date_mesure",
    extraDimension: null,
    measureMeta: {
      libelle_indicateur: "Tonnage régional de déchets",
      unite: "t / hab / an",
    },
    data: [
      {
        "cube.geocode_region": "53",
        "cube.libelle_region": "Bretagne",
        "cube.date_mesure.year": "2020-01-01T00:00:00.000",
        "cube.id_685": 10,
      },
      {
        "cube.geocode_region": "53",
        "cube.libelle_region": "Bretagne",
        "cube.date_mesure.year": "2021-01-01T00:00:00.000",
        "cube.id_685": 12,
      },
    ],
  };
}

function mountMiniChart() {
  return shallowMount(MiniChart, {
    propsData: { dataObj: nationalIndicator() },
    stubs: {
      BarChart: BarChartStub,
      MultiLineChart: true,
    },
  });
}

describe("MiniChart shared region", () => {
  beforeEach(() => {
    regionSelection.code = "";
    loadAllRegionsDataForIndicator.mockReset();
  });

  afterEach(() => {
    regionSelection.code = "";
  });

  it("keeps the national series when no territory is selected", async () => {
    const wrapper = mountMiniChart();
    await wrapper.vm.$nextTick();
    expect(loadAllRegionsDataForIndicator).not.toHaveBeenCalled();
    expect(JSON.parse(wrapper.findComponent(BarChartStub).props("y"))).toEqual([[4]]);
  });

  it("plots the shared territory when the indicator lists it", async () => {
    loadAllRegionsDataForIndicator.mockResolvedValue(bretagnePayload());
    regionSelection.code = "53";
    const wrapper = mountMiniChart();
    await wrapper.vm.loadSharedRegion();
    await wrapper.vm.$nextTick();

    expect(JSON.parse(wrapper.findComponent(BarChartStub).props("y"))).toEqual([[10, 12]]);
    expect(JSON.parse(wrapper.findComponent(BarChartStub).props("x"))).toEqual([["2020", "2021"]]);
    expect(wrapper.vm.displayData.label_indic).toBe("Tonnage régional de déchets");
    expect(wrapper.vm.displayData.label_unit).toBe("t / hab / an");
    const emitted = wrapper.emitted("regional-presentation").map((call) => call[0]);
    expect(emitted[emitted.length - 1]).toMatchObject({
      label: "Tonnage régional de déchets",
      unit: "t / hab / an",
      source: "Écolab",
    });
  });

  it("stays national when the shared territory is missing from the series", async () => {
    loadAllRegionsDataForIndicator.mockResolvedValue(bretagnePayload());
    regionSelection.code = "84";
    const wrapper = mountMiniChart();
    await wrapper.vm.loadSharedRegion();
    await wrapper.vm.$nextTick();

    expect(JSON.parse(wrapper.findComponent(BarChartStub).props("y"))).toEqual([[4]]);
  });
});
