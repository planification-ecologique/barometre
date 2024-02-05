<template>
  <nav class="fr-sidemenu fr-sidemenu--sticky-full-height fr-sidemenu__padding" role="navigation" aria-labelledby="fr-sidemenu-title">
      <SideNavigation/>
  </nav>
</template>

<script>

import axios from 'axios'
import SideNavigation from './SideNavigation.vue'

export default {
  name: 'SideBar',
  components:{
    SideNavigation
  },
  data () {
    return {
      query: {},
      listMinister: [],
      listTypesite: [],
      listSite: [],
      displayButton: false,
      selectedStart: undefined,
      selectedEnd: undefined,
      selectedMinister: undefined,
      selectedSite: undefined,
      selectedTypesite: undefined
    }
  },
  computed: {
  },
  methods: {
    get_data_api (tableName) {
      const urlApi = process.env.VUE_APP_API_URL + '/requests/get_labels_ids?table_name=' + tableName
      console.log('ENV VARiable ' + urlApi)
      axios
        .get(urlApi)
        .then(response => {
          if (tableName === 'dim_ministere') {
            this.listMinister = response.data.data.res
          }
          if (tableName === 'dim_site') {
            this.listSite = response.data.data.res
          }
          if (tableName === 'dim_type_site') {
            this.listTypesite = response.data.data.res
          }
        })
        // .catch(error => {
        //   console.log(error)
        //   this.errored = true
        // })
        // .finally(() => this.loading = false)
    },
    get_initial_params () {
      this.selectedStart = this.date_delta(31)
      this.selectedEnd = this.date_delta(1)
      this.selectedMinister = undefined
      this.selectedSite = undefined
      this.selectedTypesite = undefined
    },
    get_query () {
      var filterBy = []
      if (this.selectedMinister !== undefined) {
        filterBy.push({ field: 'id_ministere', values: [this.selectedMinister] })
      }
      if (this.selectedSite !== undefined) {
        filterBy.push({ field: 'id_site', values: [this.selectedSite] })
      }
      var studyPeriod = {}
      var comparisonPeriod = {}
      if (this.selectedStart !== undefined && this.selectedEnd !== undefined) {
        studyPeriod = { date_start: this.selectedStart, date_end: this.selectedEnd }
        var initialDates = this.get_dates_comparison(this.selectedStart, this.selectedEnd)
        comparisonPeriod = { date_start: initialDates.dateStartComparison, date_end: initialDates.dateEndComparison }
      }

      var params = { table_name: 'ft_visite' }

      if (Object.keys(studyPeriod).lenght !== 0) {
        params.study_period = studyPeriod
      }

      var sizeFilter = JSON.stringify(comparisonPeriod).length
      if (sizeFilter > 2) {
        params.comparison_period = comparisonPeriod
      }

      sizeFilter = filterBy.length
      if (sizeFilter > 0) {
        params.filter_by = filterBy
      }
      // console.log('query ' + JSON.stringify(params))
      this.$emit('query', params)
    },
    changeStart (event) {
      this.displayButton = true
      this.selectedStart = event.target.value
      this.get_query()
    },
    changeEnd (event) {
      this.displayButton = true
      this.selectedEnd = event.target.value
      this.get_query()
    },
    changeMinister (event) {
      this.displayButton = true
      this.selectedMinister = event.target.value
      this.get_query()
    },
    changeTypeSite (event) {
      this.displayButton = true
      this.selectedTypesite = event.target.value
      this.get_query()
    },
    changeSite (event) {
      this.displayButton = true
      this.selectedSite = event.target.value
      this.get_query()
    },
    date_delta (jours) {
      var newdate = new Date()
      newdate.setDate((new Date()).getDate() - jours)
      return newdate.toISOString().split('T')[0]
    },
    get_dates_comparison (dateStart, dateEnd) {
      var newStart = new Date(dateStart)
      var newEnd = new Date(dateEnd.replace(/(\d{2})-(\d{2})-(\d{4})/, '$2/$1/$3'))
      var milliseconds = Math.abs(newEnd - newStart)
      var diffDays = Math.ceil(milliseconds / (1000 * 60 * 60 * 24))
      var endComparison = this.addDays(newStart, -1)
      var startComparison = this.addDays(newStart, -(diffDays + 1))
      return { dateStartComparison: startComparison.toISOString().split('T')[0], dateEndComparison: endComparison.toISOString().split('T')[0] }
    },
    addDays (mydate, n) {
      var pastDate = new Date(mydate)
      var time = pastDate.getTime()
      var changedDate = new Date(time + (n * 24 * 60 * 60 * 1000))
      pastDate.setTime(changedDate.getTime())
      return pastDate
    },
    resetFilter () {
      this.get_initial_params()
      this.get_query()
      this.displayButton = false
    }
  },
  created () {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        /*
        Simple feature detection test to see if the browser supports the newer ResizeObserverEntry.borderBoxSize property.
        If not supported, contentRect is used.
        */
        const width = entry.borderBoxSize ? entry.borderBoxSize[0].inlineSize : entry.contentRect.width

        if (width < 992) {
          const vh = window.innerHeight * 0.01
          document.documentElement.style.setProperty('--ppg-vh', `${vh}px`)
        }
      }
    })
    resizeObserver.observe(document.body)
  },
  mounted () {
    this.get_data_api('dim_ministere')
    this.get_data_api('dim_site')
    this.listTypesite = [{ value: 'web', label: 'web' }]
    this.get_initial_params()
    this.get_query()
  }
}
</script>

<style scoped lang="scss">
$top: 2.25rem;

.fr-sidemenu__inner {
  padding: 1.5rem 1.5rem 0 0.25rem !important;
  margin-left: -0.25rem;
  .fr-accordion__btn.subtitled {
    align-items: normal;
    flex-direction: column;
    position: relative;
    > span {
      color: var(--text-mention-grey);
      display: block;
      font-size: 0.75rem;
      font-weight: normal;
    }
    &::after {
      position: absolute;
      right: 0;
      margin-right: 16px;
      top: 1rem;
    }
  }
  .mobile-header {
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: inherit;
    box-shadow: 0 1px 0 0 var(--border-default-grey);
    p {
      flex: 1;
    }
  }
  .fr-btns-group {
    box-shadow: inset 0 1px 0 0 var(--border-default-grey);
    position: sticky;
    bottom: 0;
    z-index: 1;
    background-color: inherit;
    .fr-btn {
      margin: 0;
      width: 100%;
    }
  }
}

@media (max-width: 62em) {
  .fr-sidemenu {
    left: 0;
    margin: 0;
    position: fixed;
    top: $top;
    width: 100%;
    z-index: 5000;

    &.displayed {
      display: flex !important;
    }

    &::before {
      content: "";
      background-color: rgba(22, 22, 22, 0.64);
      height: 100%;
      left: 0;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: -1;
    }
  }

  .fr-sidemenu__inner {
    width: 100%;
    padding: 0 1rem !important;
    margin-left: 0;
    background-color: var(--background-overlap-grey);

    #scrollable {
      height: calc((var(--ppg-vh, 1vh) * 100) - #{$top} - 9rem) !important;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
}

.fr-sidemenu__padding {
  padding-right: 0rem !important;
}
</style>
