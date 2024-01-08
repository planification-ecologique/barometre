import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      // selectedGeoLevel: 'NAT',
      // selectedGeoCode: 'FRANCE',
      // selectedReg: '',
      // selectedDep: '',
      selectedStart: undefined,
      selectedEnd: undefined,
      selectedTheme: undefined,
      selectedTypesite: undefined,
      selectedSite: undefined
      // selectedEng: undefined,
      // selectedPage: 1
    },
    // filter: {
    //   clickableEng: [],
    //   clickableTheme: [],
    //   clickableReg: [],
    //   clickableDep: [],
    //   clickableTypesite: []
    // },
    data: {
      dataFilter: [],
      listResults: []
    }
    // save: {
    //   selectedGeoLevel: 'NAT',
    //   selectedGeoCode: 'FRANCE',
    //   selectedReg: '',
    //   selectedDep: '',
    //   selectedStart: undefined,
    //   selectedEnd: undefined,
    //   selectedTheme: undefined,
    //   selectedTypesite: undefined,
    //   selectedSite: undefined,
    //   selectedEng: undefined
    // }
  },
  mutations: {
    // setClickableEng (state, payload) {
    //   state.filter.clickableEng = payload
    // },
    // setClickableTheme (state, payload) {
    //   console.log('pay' + payload)
    //   state.filter.clickableTheme = payload
    // },
    // setClickableTypesite (state, payload) {
    //   state.filter.clickableTypesite = payload
    // },
    // setClickableReg (state, payload) {
    //   state.filter.clickableReg = payload
    // },
    // setClickableDep (state, payload) {
    //   state.filter.clickableDep = payload
    // },
    // setSelectedPage (state, payload) {
    //   state.user.selectedPage = payload
    // },
    // setSelectedReg (state, payload) {
    //   state.user.selectedReg = payload
    // },
    // setSelectedDep (state, payload) {
    //   state.user.selectedDep = payload
    // },
    // setSelectedGeoLevel (state, payload) {
    //   state.user.selectedGeoLevel = payload
    // },
    // setSelectedGeoCode (state, payload) {
    //   state.user.selectedGeoCode = payload
    // },
    setSelectedStart (state, payload) {
      state.user.selectedStart = payload
    },
    setSelectedEnd (state, payload) {
      state.user.selectedEnd = payload
    },
    setSelectedTheme (state, payload) {
      state.user.selectedTheme = payload
    },
    setSelectedTypesite (state, payload) {
      state.user.selectedTypesite = payload
    },
    setSelectedSite (state, payload) {
      state.user.selectedSite = payload
    },
    // setSelectedEng (state, payload) {
    //   state.user.selectedEng = payload
    // },
    setUserChoices (state, payload) {
      // state.user.selectedGeoLevel = payload.level
      // state.user.selectedGeoCode = payload.code
      state.user.selectedStart = payload.start
      state.user.selectedEnd = payload.end
      state.user.selectedTheme = payload.theme
      state.user.selectedTypesite = payload.typesite
      state.user.selectedSite = payload.site
      // state.user.selectedEng = payload.engagement
      // state.user.selectedReg = payload.reg
      // state.user.selectedDep = payload.dep
      // state.user.selectedPage = payload.page
    },
    setListResults (state, payload) {
      state.data.listResults = payload
    },
    setDataFilter (state, payload) {
      state.data.dataFilter = payload
    },
    saveUserChoices (state, payload) {
      // state.save.selectedGeoLevel = payload.level
      // state.save.selectedGeoCode = payload.code
      state.save.selectedStart = payload.start
      state.save.selectedEnd = payload.end
      state.save.selectedTheme = payload.theme
      state.save.selectedTypesite = payload.typesite
      state.save.selectedsite = payload.site
      // state.save.selectedEng = payload.engagement
      // state.save.selectedReg = payload.reg
      // state.save.selectedDep = payload.dep
      // state.save.selectedPage = payload.page
    }
  }
})
