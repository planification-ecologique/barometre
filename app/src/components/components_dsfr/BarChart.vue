<template>
    <div class="widget_container fr-grid-row" :id="widgetId">
      <div class="r_col fr-col-12">
        <div class="chart">
          <div class="linechart_tooltip">
            <div class="tooltip_header"></div>
            <div class="tooltip_body">
              <div class="tooltip_value">
                <span class="tooltip_dot"></span>
              </div>
            </div>
          </div>
          <canvas :id="chartId"></canvas>
          <div class="bar-chart-legend" :style="legendMarginStyle">
            <div class="bar-chart-legend-row">
              <div
                v-for="(item, index) in nameParse"
                :key="'legend-name-' + index"
                class="bar-chart-legend-item"
              >
                <span class="legende_dot" :style="{ 'background-color': colorParse[index] }"></span>
                <span class="bar-chart-legend-label">{{ capitalize(item) }}</span>
              </div>
              <template v-if="nameParse.length <= 1">
                <div
                  v-for="(item2, index2) in hlineNameParse"
                  :key="'legend-hline-' + index2"
                  class="bar-chart-legend-item"
                >
                  <div class="bar-chart-legend-dash" aria-hidden="true">
                    <span class="legende_dash_line1" :style="{ 'background-color': hlineColorParse[index2] }"></span>
                    <span class="legende_dash_line2" :style="{ 'background-color': hlineColorParse[index2] }"></span>
                  </div>
                  <span class="bar-chart-legend-label">{{ capitalize(item2) }}</span>
                </div>
                <div
                  v-for="(item3, index3) in vlineNameParse"
                  :key="'legend-vline-' + index3"
                  class="bar-chart-legend-item"
                >
                  <div class="bar-chart-legend-dash" aria-hidden="true">
                    <span class="legende_dash_line1" :style="{ 'background-color': vlineColorParse[index3] }"></span>
                    <span class="legende_dash_line2" :style="{ 'background-color': vlineColorParse[index3] }"></span>
                  </div>
                  <span class="bar-chart-legend-label">{{ capitalize(item3) }}</span>
                </div>
                <div v-if="trendLineParse.length > 0" class="bar-chart-legend-item">
                  <div class="bar-chart-legend-dash" aria-hidden="true">
                    <span class="legende_dash_line1" :style="{ 'background-color': trendLineColor }"></span>
                    <span class="legende_dash_line2" :style="{ 'background-color': trendLineColor }"></span>
                  </div>
                  <span class="bar-chart-legend-label">Rythme actuel (3 ans)</span>
                </div>
                <div
                  v-if="targetTrajectoryParse || targetSegmentParse"
                  class="bar-chart-legend-item"
                >
                  <span class="legende_dot_circle" :style="{ 'background-color': targetSegmentColor }"></span>
                  <span class="bar-chart-legend-label">Cible(s)</span>
                </div>
              </template>
            </div>
            <div
              v-if="nameParse.length > 1 && hasAuxiliaryLegend"
              class="bar-chart-legend-row bar-chart-legend-row--secondary"
            >
              <div
                v-for="(item2, index2) in hlineNameParse"
                :key="'legend-hline-2-' + index2"
                class="bar-chart-legend-item"
              >
                <div class="bar-chart-legend-dash" aria-hidden="true">
                  <span class="legende_dash_line1" :style="{ 'background-color': hlineColorParse[index2] }"></span>
                  <span class="legende_dash_line2" :style="{ 'background-color': hlineColorParse[index2] }"></span>
                </div>
                <span class="bar-chart-legend-label">{{ capitalize(item2) }}</span>
              </div>
              <div
                v-for="(item3, index3) in vlineNameParse"
                :key="'legend-vline-2-' + index3"
                class="bar-chart-legend-item"
              >
                <div class="bar-chart-legend-dash" aria-hidden="true">
                  <span class="legende_dash_line1" :style="{ 'background-color': vlineColorParse[index3] }"></span>
                  <span class="legende_dash_line2" :style="{ 'background-color': vlineColorParse[index3] }"></span>
                </div>
                <span class="bar-chart-legend-label">{{ capitalize(item3) }}</span>
              </div>
              <div v-if="trendLineParse.length > 0" class="bar-chart-legend-item">
                <div class="bar-chart-legend-dash" aria-hidden="true">
                  <span class="legende_dash_line1" :style="{ 'background-color': trendLineColor }"></span>
                  <span class="legende_dash_line2" :style="{ 'background-color': trendLineColor }"></span>
                </div>
                <span class="bar-chart-legend-label">Rythme actuel (3 ans)</span>
              </div>
              <div
                v-if="targetTrajectoryParse || targetSegmentParse"
                class="bar-chart-legend-item"
              >
                <span class="legende_dot_circle" :style="{ 'background-color': targetSegmentColor }"></span>
                <span class="bar-chart-legend-label">Cible(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  import { Chart } from 'chart.js'
  import { mixin } from '@/utils.js'
  import { resolvePrimaryBarToken, resolveTargetLineToken, getFallbackPrimaryBarToken } from '@/services/chartColorTestOverrides.js'
  import annotationPlugin from 'chartjs-plugin-annotation'
  
  Chart.pluginService.register(annotationPlugin)
  
  export default {
    name: 'MultiLineChart',
    mixins: [mixin],
    data () {
      return {
        widgetId: '',
        chartId: '',
        chart: undefined,
        legendLeftMargin: 100,
        display: '',
        datasets: [],
        labels: undefined,
        xparse: [],
        yparse: [],
        nameParse: [],
        tmpColorParse: [],
        colorParse: [],
        listColors: [],
        vlineParse: [],
        vlineColorParse: [],
        tmpVlineColorParse: [],
        vlineNameParse: [],
        hlineParse: [],
        hlineColorParse: [],
        tmpHlineColorParse: [],
        hlineNameParse: [],
        pointOpacityParse: [],
        typeGraph: '',
        ymax: 0,
        isPercentUnit: false,
        annotations: [],
        colorPrecisionBar: '#161616',
        colorBox: '#2f2f2f',
        colorHover: [],
        viewportSmall: false,
        trendLineParse: [],
        trendLineColor: '#6a6156',
        targetSegmentParse: null,
        targetTrajectoryParse: null,
        targetSegmentColor: '#000091'
      }
    },
    props: {
      x: {
        type: String,
        required: true
      },
      y: {
        type: String,
        required: true
      },
      name: {
        type: String,
        default: undefined
      },
      color: {
        type: String,
        default: undefined
      },
      vline: {
        type: String,
        default: undefined
      },
      vlinecolor: {
        type: String,
        default: undefined
      },
      vlinename: {
        type: String,
        default: undefined
      },
      hline: {
        type: String,
        default: undefined
      },
      hlinecolor: {
        type: String,
        default: undefined
      },
      hlinename: {
        type: String,
        default: undefined
      },
      stacked: {
        type: Boolean,
        default: false
      },
      horizontal: {
        type: Boolean,
        default: false
      },
      barsize: {
        type: Number,
        default: undefined
      },
      date: {
        type: String,
        default: undefined
      },
      aspectratio: {
        type: Number,
        default: 2
      },
      formatdate: {
        type: Boolean,
        default: false
      },
      pointopacity: {
        type: String,
        default: undefined
      },
      trendline: {
        type: String,
        default: undefined
      },
      targetSegment: {
        type: String,
        default: undefined
      },
      'target-segment': {
        type: String,
        default: undefined
      },
      targetTrajectory: {
        type: String,
        default: undefined
      },
      'target-trajectory': {
        type: String,
        default: undefined
      },
      pointRadius: {
        type: Number,
        default: 4
      },
      axisFontSize: {
        type: Number,
        default: 12
      },
      isSmall: {
        type: Boolean,
        default: false
      },
      unit: {
        type: String,
        default: ''
      },
      /** Jeton DSFR pour la ligne de cible (aperçus modale sans synchroniser l’état global). */
      previewTargetToken: {
        type: String,
        default: undefined
      }
    },
    watch: {
      color: function () {
        this.resetData()
        this.createChart()
      },
      previewTargetToken: function () {
        this.resetData()
        this.createChart()
      },
      y: function () {
        this.resetData()
        this.createChart()
      },
      trendline: function () {
        this.resetData()
        this.createChart()
      },
      targetSegment: function () {
        this.resetData()
        this.createChart()
      },
      targetTrajectory: function () {
        this.resetData()
        this.createChart()
      },
      unit: function () {
        this.resetData()
        this.createChart()
      },
      stacked: function () {
        this.resetData()
        this.createChart()
      }
    },
    computed: {
      effectiveIsSmall () {
        return this.isSmall === true ? true : this.viewportSmall
      },
      legendMarginStyle () {
        const px = Math.max(0, Number(this.legendLeftMargin) || 0)
        return { marginLeft: px + 'px' }
      },
      hasAuxiliaryLegend () {
        return (
          (this.hlineNameParse && this.hlineNameParse.length > 0) ||
          (this.vlineNameParse && this.vlineNameParse.length > 0) ||
          (this.trendLineParse && this.trendLineParse.length > 0) ||
          !!this.targetTrajectoryParse ||
          !!this.targetSegmentParse
        )
      }
    },
    methods: {
      resetData () {
        if (this.chart && typeof this.chart.destroy === 'function') {
          this.chart.destroy()
        }
        this.legendLeftMargin = 100
        this.display = ''
        this.datasets = []
        this.labels = undefined
        this.xparse = []
        this.yparse = []
        this.nameParse = []
        this.tmpColorParse = []
        this.colorParse = []
        this.listColors = []
        this.vlineParse = []
        this.vlineColorParse = []
        this.tmpVlineColorParse = []
        this.vlineNameParse = []
        this.hlineParse = []
        this.hlineColorParse = []
        this.tmpHlineColorParse = []
        this.hlineNameParse = []
        this.typeGraph = ''
        this.ymax = 0
        this.isPercentUnit = false
        this.annotations = []
        this.colorPrecisionBar = '#161616'
        this.colorBox = '#2f2f2f'
        this.colorHover = []
        this.trendLineParse = []
        this.targetSegmentParse = null
        this.targetTrajectoryParse = null
      },
      getData () {
        const self = this
        // Récupération des paramètres
        if (this.horizontal) {
          this.typeGraph = 'horizontalBar'
        } else {
          this.typeGraph = 'bar'
        }
        this.listColors = this.getAllColors()
        this.xparse = JSON.parse(this.x)
        this.yparse = JSON.parse(this.y)
        if (this.pointopacity !== undefined) {
          try { this.pointOpacityParse = JSON.parse(this.pointopacity) } catch (e) { this.pointOpacityParse = [] }
        } else {
          this.pointOpacityParse = []
        }
        let tmpNameParse = []
        if (this.name !== undefined) {
          tmpNameParse = JSON.parse(self.name)
        }
        if (this.color !== undefined) {
          this.tmpColorParse = JSON.parse(self.color)
        }
  
        this.loadColors()
        for (let i = 0; i < this.yparse.length; i++) {
          if (tmpNameParse[i] !== undefined) {
            self.nameParse.push(tmpNameParse[i])
          } else {
            self.nameParse.push('Serie' + (i + 1))
          }
        }
  
        // Récupération données Vline
        if (this.vline !== undefined) {
          this.vlineParse = JSON.parse(this.vline)
          let tmpVlineNameParse = []
          if (this.vlinename !== undefined) {
            tmpVlineNameParse = JSON.parse(self.vlinename)
          }
          if (this.vlinecolor !== undefined) {
            this.tmpVlineColorParse = JSON.parse(self.vlinecolor)
          }
  
          for (let i = 0; i < this.vlineParse.length; i++) {
            if (tmpVlineNameParse[i] !== undefined) {
              self.vlineNameParse.push(tmpVlineNameParse[i])
            } else {
              self.vlineNameParse.push('V' + (i + 1))
            }
          }
        }
  
        // Récupération données Hline
        if (this.hline !== undefined) {
          this.hlineParse = JSON.parse(this.hline)
          let tmpHlineNameParse = []
          if (this.hlinename !== undefined) {
            tmpHlineNameParse = JSON.parse(self.hlinename)
          }
          if (this.hlinecolor !== undefined) {
            this.tmpHlineColorParse = JSON.parse(self.hlinecolor)
          }
  
          for (let i = 0; i < this.hlineParse.length; i++) {
            if (tmpHlineNameParse[i] !== undefined) {
              self.hlineNameParse.push(tmpHlineNameParse[i])
            } else {
              self.hlineNameParse.push('H' + (i + 1))
            }
          }
        }
  
        // Formatage des données
        let data = []

        // Cas ou x est non numérique
        data = self.yparse
        self.labels = self.xparse[0]
        self.xAxisType = 'category'

        // Trend line (linear regression on last 3 years of measured data)
        if (this.trendline !== undefined) {
          try {
            self.trendLineParse = JSON.parse(this.trendline)
            if (!Array.isArray(self.trendLineParse) || self.trendLineParse.length !== self.labels.length) {
              self.trendLineParse = []
            }
          } catch (e) {
            self.trendLineParse = []
          }
        } else {
          self.trendLineParse = []
        }
        // Target trajectory: line from reference through all targets, with dots at targets
        const rawTargetTrajectory = this.targetTrajectory ?? this['target-trajectory'] ?? (this.$props && (this.$props.targetTrajectory ?? this.$props['target-trajectory']))
        const rawTargetSegment = this.targetSegment ?? this['target-segment'] ?? (this.$props && (this.$props.targetSegment ?? this.$props['target-segment']))
        self.targetTrajectoryParse = null
        self.targetSegmentParse = null
        self.targetIsTargetByYear = {}
        if (rawTargetTrajectory !== undefined && rawTargetTrajectory !== null && rawTargetTrajectory !== '') {
          try {
            const traj = JSON.parse(rawTargetTrajectory)
            if (traj && Array.isArray(traj.points) && traj.points.length >= 2) {
              const valid = traj.points.every(p => p.year != null && !isNaN(Number(p.value)))
              if (valid) self.targetTrajectoryParse = traj
            }
          } catch (e) { /* ignore */ }
        }
        if (!self.targetTrajectoryParse && rawTargetSegment !== undefined && rawTargetSegment !== null && rawTargetSegment !== '') {
          try {
            const seg = JSON.parse(rawTargetSegment)
            if (seg && seg.startYear != null && seg.endYear != null) {
              const startVal = Number(seg.startValue)
              const endVal = Number(seg.endValue)
              if (!isNaN(startVal) && !isNaN(endVal)) {
                self.targetSegmentParse = {
                  startYear: String(seg.startYear),
                  startValue: startVal,
                  endYear: String(seg.endYear),
                  endValue: endVal
                }
              }
            }
          } catch (e) { /* ignore */ }
        }

        // Après parsing cible : loadColors() a déjà été appelé plus tôt quand target*Parse était encore null
        if (self.targetTrajectoryParse || self.targetSegmentParse) {
          self.targetSegmentColor = self.getHexaFromName(self.resolveTargetTokenForCanvas())
        }
  
        // Set ymax: include bar data, target trajectory, and hlines so targets stay visible
        if (!this.horizontal) {
          let maxVal = 0
          if (self.stacked && self.yparse && self.yparse.length > 1 && self.labels) {
            self.labels.forEach(function (_label, index) {
              let stackTotal = 0
              let hasValue = false
              self.yparse.forEach(function (dj) {
                const v = dj && dj[index]
                if (v != null && !isNaN(v)) {
                  stackTotal += Math.abs(Number(v))
                  hasValue = true
                }
              })
              if (hasValue && stackTotal > maxVal) maxVal = stackTotal
            })
          } else if (self.yparse && self.yparse.length > 0) {
            self.yparse.forEach(function (dj) {
              (dj || []).forEach(function (v) {
                if (v != null && !isNaN(v) && v > maxVal) maxVal = v
              })
            })
          }
          if (self.targetTrajectoryParse && self.targetTrajectoryParse.points) {
            self.targetTrajectoryParse.points.forEach(function (p) {
              const v = Number(p.value)
              if (!isNaN(v) && v > maxVal) maxVal = v
            })
          }
          if (self.targetSegmentParse) {
            const v1 = Number(self.targetSegmentParse.startValue)
            const v2 = Number(self.targetSegmentParse.endValue)
            if (!isNaN(v1) && v1 > maxVal) maxVal = v1
            if (!isNaN(v2) && v2 > maxVal) maxVal = v2
          }
          if (self.hlineParse && self.hlineParse.length > 0) {
            const hMax = Math.max.apply(null, self.hlineParse)
            if (!isNaN(hMax) && hMax > maxVal) maxVal = hMax
          }
          self.ymax = maxVal > 0 ? maxVal * 1.05 : (self.hlineParse?.length ? Math.max.apply(null, self.hlineParse) : 100)
          // Pour les unités en pourcent : plafonner l'axe Y à 120 (max au lieu de suggestedMax pour forcer la limite)
          const unitStr = (this.unit || '').toLowerCase()
          self.isPercentUnit = unitStr.includes('pourcent') || unitStr.includes('%')
          if (self.isPercentUnit) {
            self.ymax = Math.min(self.ymax, 100)
          }
        }
  
        // Annotation
        if (this.horizontal) {
          const xlenght = self.xparse[0].length
          let nanno
          if ((xlenght % 2) === 0) {
            nanno = xlenght / 2
          } else {
            nanno = Math.floor(xlenght / 2) + 1
          }
  
          let sumY = 0
          self.yparse.forEach(function (y, j) {
            sumY = sumY + Math.abs(y)
          })
  
          let j = 0
          for (let i = 0; i < nanno; i++) {
            const anno = {
              type: 'box',
              drawTime: 'beforeDatasetsDraw',
              id: 'box' + i,
              xScaleID: 'x-axis-0',
              yScaleID: 'y-axis-0',
              xMin: -2 * sumY,
              xMax: 2 * sumY,
              yMax: j + 0.48,
              yMin: j - 0.48,
              backgroundColor: self.colorBox,
              borderColor: self.colorBox
            }
  
            j = j + 2
            self.annotations.push(anno)
          }
        }
  
        // Barres : opacité pleine (plus de distinction mesuré / projection par transparence).
        // Au survol, conserver les mêmes couleurs que l’état normal pour éviter le contraste marqué des teintes DSFR « hover ».
        data.forEach(function (dj, j) {
          const colors = dj.map(function () {
            return self.hexToRgba(self.colorParse[j], 1)
          })
          self.datasets.push({
            data: dj,
            stack: self.stacked ? 'stack0' : undefined,
            borderColor: colors,
            backgroundColor: colors,
            hoverBorderColor: colors,
            hoverBackgroundColor: colors,
            // barThickness: 'flex'
          })
        })
        // Add line dataset for target trajectory so target-only years are hoverable
        if (!this.horizontal && self.targetTrajectoryParse && self.targetTrajectoryParse.points) {
          const trajByYear = {}
          const trajIsTargetByYear = {}
          self.targetTrajectoryParse.points.forEach(function (p) {
            trajByYear[String(p.year)] = p.value
            trajIsTargetByYear[String(p.year)] = !!p.isTarget
          })
          const targetData = self.labels.map(function (label) {
            return trajByYear[String(label)] != null ? trajByYear[String(label)] : null
          })
          const dotSize = self.pointRadius
          const targetPointRadius = self.labels.map(function (label) {
            return trajIsTargetByYear[String(label)] ? dotSize : 0
          })
          self.targetIsTargetByYear = trajIsTargetByYear
          self.datasets.push({
            _targetTrajectory: true,
            type: 'line',
            data: targetData,
            borderColor: self.targetSegmentColor,
            backgroundColor: self.targetSegmentColor,
            borderWidth: 2,
            borderDash: [6, 4],
            lineTension: 0,
            pointRadius: targetPointRadius,
            pointBackgroundColor: self.targetSegmentColor,
            pointBorderColor: self.targetSegmentColor,
            fill: false,
            spanGaps: true,
            order: -1
          })
        }
      },
      createChart () {
        Chart.defaults.global.defaultFontFamily = 'Marianne'
        Chart.defaults.global.defaultFontSize = 12
        Chart.defaults.global.defaultLineHeight = 1.66
        Chart.defaults.global.defaultFontColor = '#3a3a3a'
  
        this.getData()
        const self = this
        const ctx = document.getElementById(self.chartId).getContext('2d')
        this.chart = new Chart(ctx, {
          type: self.typeGraph,
          data: {
            labels: self.labels,
            datasets: self.datasets
          },
          
          plugins: [{
            afterLayout: function (chart) {
              const ca = chart.chartArea
              if (ca && typeof ca.left === 'number' && !isNaN(ca.left)) {
                self.legendLeftMargin = Math.max(0, Math.round(ca.left))
              }
            }
          }, {
            afterDatasetDraw: function (chart, args, options) {
              if (self.vlineParse !== undefined) {
                self.vlineParse.forEach(function (line, j) {
                  const ctx = chart.ctx
                  const xAxis = chart.scales['x-axis-0']
                  const yAxis = chart.scales['y-axis-0']
  
                  const x = xAxis.getPixelForValue(line)
  
                  ctx.beginPath()
                  ctx.moveTo(x, yAxis.bottom)
                  ctx.strokeStyle = self.vlineColorParse[j]
                  ctx.lineWidth = '3'
                  ctx.setLineDash([10, 5])
                  ctx.lineTo(x, yAxis.top)
                  ctx.stroke()
                })
              }
              if (self.hlineParse !== undefined) {
                self.hlineParse.forEach(function (line, j) {
                  const ctx = chart.ctx
                  const xAxis = chart.scales['x-axis-0']
                  const yAxis = chart.scales['y-axis-0']
                  const y = yAxis.getPixelForValue(line)

                  ctx.beginPath()
                  ctx.moveTo(xAxis.left, y)
                  ctx.strokeStyle = self.hlineColorParse[j]
                  ctx.lineWidth = '3'
                  ctx.setLineDash([10, 5])
                  ctx.lineTo(xAxis.right, y)
                  ctx.stroke()
                })
              }
            }
          },
          {
            afterDraw: function (chart, args, options) {
              // Trend line (vertical bar chart only) – draw on top of bars
              if (!self.horizontal && self.trendLineParse.length > 0) {
                const ctx = chart.ctx
                const xAxis = chart.scales['x-axis-0']
                const yAxis = chart.scales['y-axis-0']
                ctx.save()
                ctx.beginPath()
                let first = true
                for (let i = 0; i < self.trendLineParse.length; i++) {
                  if (self.trendLineParse[i] == null) continue
                  const x = xAxis.getPixelForValue(self.labels[i])
                  const y = yAxis.getPixelForValue(self.trendLineParse[i])
                  if (first) { ctx.moveTo(x, y); first = false } else ctx.lineTo(x, y)
                }
                ctx.strokeStyle = self.trendLineColor
                ctx.lineWidth = 2
                ctx.setLineDash([6, 4])
                ctx.stroke()
                ctx.restore()
              }
              // Target segment (legacy): drawn manually when no targetTrajectory
              if (!self.horizontal && self.targetSegmentParse && !self.targetTrajectoryParse) {
                const ctx = chart.ctx
                const xAxis = chart.scales['x-axis-0']
                const yAxis = chart.scales['y-axis-0']
                const seg = self.targetSegmentParse
                const points = [
                  { x: xAxis.getPixelForValue(seg.startYear), y: yAxis.getPixelForValue(seg.startValue), isTarget: false },
                  { x: xAxis.getPixelForValue(seg.endYear), y: yAxis.getPixelForValue(seg.endValue), isTarget: true }
                ]
                if (points.length >= 2) {
                  ctx.save()
                  ctx.beginPath()
                  ctx.moveTo(points[0].x, points[0].y)
                  ctx.lineTo(points[1].x, points[1].y)
                  ctx.strokeStyle = self.targetSegmentColor
                  ctx.lineWidth = 2
                  ctx.setLineDash([6, 4])
                  ctx.stroke()
                  ctx.beginPath()
                  ctx.arc(points[1].x, points[1].y, self.pointRadius, 0, 2 * Math.PI)
                  ctx.fillStyle = self.targetSegmentColor
                  ctx.fill()
                  ctx.restore()
                }
              }
              if (chart.tooltip._active !== undefined) {
                if (chart.tooltip._active.length !== 0) {
                  const x = chart.tooltip._active[0]._model.x
                  const y = chart.tooltip._active[0]._model.y
                  const yAxis = chart.scales['y-axis-0']
                  const xAxis = chart.scales['x-axis-0']
                  const ctx = chart.ctx
  
                  if (self.horizontal) {
                    ctx.save()
                    ctx.beginPath()
                    ctx.moveTo(x, yAxis.top)
                    ctx.lineTo(x, yAxis.bottom)
                    ctx.lineWidth = '1'
                    ctx.strokeStyle = self.colorPrecisionBar
                    ctx.setLineDash([10, 5])
                    ctx.stroke()
                    ctx.restore()
                  } else {
                    ctx.save()
                    ctx.beginPath()
                    ctx.moveTo(xAxis.left, y)
                    ctx.lineTo(xAxis.right, y)
                    ctx.lineWidth = '1'
                    ctx.strokeStyle = self.colorPrecisionBar
                    ctx.setLineDash([10, 5])
                    ctx.stroke()
                    ctx.restore()
                  }
                }
              }
            }
          }],
          options: {
            aspectRatio: this.aspectratio,
            animation: {
              easing: 'easeInOutBack',
              duration: 1000
            },
            annotation: {
              drawTime: 'beforeDatasetsDraw',
              annotations: self.annotations
            },
            scales: {
              xAxes: [{
                stacked: self.stacked,
                offset: true,
                gridLines: {
                  zeroLineColor: '#DDDDDD',
                  drawOnChartArea: false,
                  color: '#DDDDDD',
                  lineWidth: 1,
                  barPercentage: 0.8
                },
                ticks: {
                  fontColor: '#161616',
                  fontSize: self.axisFontSize,
                  maxRotation: self.effectiveIsSmall ? 0 : 45,
                  minRotation: self.effectiveIsSmall ? 0 : 0,
                  autoSkip: false,
                  callback: self.chartXAxisTickCallback(self.labels.length)
                }
              }],
              yAxes: [{
                stacked: self.stacked,
                gridLines: {
                  drawTicks: false,
                  zeroLineColor: '#DDDDDD',
                  color: '#DDDDDD',
                  borderDash: [3],
                  lineWidth: 1
                },
                ticks: {
                  fontColor: '#161616',
                  fontSize: self.axisFontSize,
                  suggestedMin: 0,
                  padding: 8,
                  ...(self.isPercentUnit ? { max: self.ymax } : { suggestedMax: self.ymax }),
                  autoSkip: true,
                  maxTicksLimit: 5,
                  callback: function (value) {
                    return self.formatChartAxisTick(value)
                  }
                }
              }]
            },
            legend: {
              display: false
            },
            tooltips: {
              enabled: false,
              displayColors: false,
              backgroundColor: '#6b6b6b',
              callbacks: {
                label: function (tooltipItems) {
                  const label = []
                  self.datasets.forEach(function (set, i) {
                    if (set._targetTrajectory) {
                      const v = set.data[tooltipItems.index]
                      label.push(v != null && !isNaN(v) ? self.convertIntToHuman(v) : null)
                    } else {
                      label.push(self.convertIntToHuman(set.data[tooltipItems.index]))
                    }
                  })
                  return label
                },
                title: function (tooltipItems) {
                  return tooltipItems[0].label
                },
                labelTextColor: function (tooltipItems) {
                  const colors = (self.colorParse || []).slice()
                  if (self.datasets.some(function (d) { return d._targetTrajectory })) {
                    colors.push(self.targetSegmentColor)
                  }
                  return colors
                }
              },
              custom: function (context) {
                // Tooltip Element
                const tooltipEl = self.$el.querySelector('.linechart_tooltip')
  
                // Hide if no tooltip
                const tooltipModel = context
                if (tooltipModel.opacity === 0) {
                  tooltipEl.style.opacity = 0
                  return
                }
  
                // Set caret Position
                tooltipEl.classList.remove('above', 'below', 'no-transform')
                if (tooltipModel.yAlign) {
                  tooltipEl.classList.add(tooltipModel.yAlign)
                } else {
                  tooltipEl.classList.add('no-transform')
                }
  
                function getBody (bodyItem) {
                  return bodyItem.lines
                }
                // Set Text
                if (tooltipModel.body) {
                  const titleLines = tooltipModel.title || []
                  const bodyLines = tooltipModel.body.map(getBody)

                  const divDate = self.$el.querySelector('.tooltip_header')
                  if (divDate) divDate.innerHTML = titleLines[0]

                  const color = tooltipModel.labelTextColors[0]
                  const divValue = self.$el.querySelector('.tooltip_value')
                  const tooltipDot = self.$el.querySelector('.tooltip_dot')
                  const nodeName = tooltipDot && tooltipDot.attributes && tooltipDot.attributes[0]
                    ? tooltipDot.attributes[0].nodeName
                    : 'style'
                  if (!divValue) return
                  divValue.innerHTML = ''
                  const items = []
                  bodyLines[0].forEach(function (line, i) {
                    if (line != null && line !== undefined && line !== "NaN" && line !== "null" && line !== "0") {
                      const set = self.datasets[i]
                      const isTargetDataset = set && set._targetTrajectory
                      const hoveredYear = titleLines[0]
                      if (isTargetDataset && self.targetIsTargetByYear && !self.targetIsTargetByYear[String(hoveredYear)]) {
                        return
                      }
                      const seriesLabel = isTargetDataset
                        ? 'Cible(s)'
                        : ((self.nameParse && self.nameParse[i]) ? self.capitalize(self.nameParse[i]) : '')
                      items.push({ line, color: (color && color[i]) || self.targetSegmentColor, label: seriesLabel })
                    }
                  })
                  if (self.stacked && items.length > 1) {
                    items.reverse()
                  }
                  items.forEach(function (item) {
                    divValue.innerHTML +=
                      '<span ' + nodeName + '= "" class="tooltip_dot" style="background-color:' + item.color + '"></span>' +
                      ' ' + item.line +
                      (item.label ? ' – ' + item.label : '') +
                      '<br>'
                  })
                }
  
                const {
                  offsetLeft: positionX,
                  offsetTop: positionY
                } = self.chart.canvas
  
                const canvasWidth = Number(self.chart.canvas.style.width.replace(/\D/g, ''))
                const canvasHeight = Number(self.chart.canvas.style.height.replace(/\D/g, ''))
                tooltipEl.style.position = 'absolute'
                tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px'
                tooltipEl.style.pointerEvents = 'none'
                let tooltipX = positionX + tooltipModel.caretX + 10
                let tooltipY = positionY + tooltipModel.caretY - 18
                if (tooltipX + tooltipEl.clientWidth + self.legendLeftMargin > positionX + canvasWidth) { // tooltip disappears at the right of the canvas
                  tooltipX = positionX + tooltipModel.caretX - tooltipEl.clientWidth - 10
                }
                if (tooltipY + tooltipEl.clientHeight > positionY + 0.9 * canvasHeight) { // tooltip disappears at the bottom of the canvas
                  tooltipY = positionY + tooltipModel.caretY - tooltipEl.clientHeight + 18
                }
                if (tooltipX < positionX) {
                  tooltipX = positionX + tooltipModel.caretX - tooltipEl.clientWidth / 2
                  tooltipY = positionY + tooltipModel.caretY - tooltipEl.clientHeight - 18
                }
                tooltipEl.style.left = tooltipX + 'px'
                tooltipEl.style.top = tooltipY + 'px'
                tooltipEl.style.opacity = 1
              }
            }
          }
        })
      },
      loadColors () {
        this.colorParse = []
        this.colorHover = []
        for (let i = 0; i < this.yparse.length; i++) {
          if (this.tmpColorParse[i] !== undefined) {
            this.colorParse.push(this.getHexaFromName(this.tmpColorParse[i]))
            this.colorHover.push(this.getHexaFromName(this.tmpColorParse[i], { hover: true }))
          } else {
            this.colorParse.push(this.getHexaFromName(this.listColors[i]))
            this.colorHover.push(this.getHexaFromName(this.listColors[i], { hover: true }))
          }
        }
  
        this.vlineColorParse = []
        for (let i = 0; i < this.vlineParse.length; i++) {
          if (this.tmpVlineColorParse[i] !== undefined) {
            this.vlineColorParse.push(this.getHexaFromName(this.tmpVlineColorParse[i]))
          } else {
            const vTok = resolvePrimaryBarToken(getFallbackPrimaryBarToken())
            this.vlineColorParse.push(this.getHexaFromName(vTok))
          }
        }
  
        this.hlineColorParse = []
        for (let i = 0; i < this.hlineParse.length; i++) {
          if (this.tmpHlineColorParse[i] !== undefined) {
            this.hlineColorParse.push(this.getHexaFromName(this.tmpHlineColorParse[i]))
          } else {
            this.hlineColorParse.push(this.getHexaFromName('beige-gris-galet'))
          }
        }
        if (this.trendLineParse.length > 0) {
          this.trendLineColor = (this.colorParse.length > 0)
            ? this.colorParse[0]
            : this.getHexaFromName('beige-gris-galet')
        }
        if (this.targetSegmentParse || this.targetTrajectoryParse) {
          this.targetSegmentColor = this.getHexaFromName(this.resolveTargetTokenForCanvas())
        }
      },
      resolveTargetTokenForCanvas () {
        if (this.previewTargetToken != null && String(this.previewTargetToken).trim() !== '') {
          return String(this.previewTargetToken).trim()
        }
        return resolveTargetLineToken('blue-ecume')
      },
      changeColors (theme) {
        const effectiveTheme = theme || 'light'
        const fontColor = this.getHexaFromToken('text-mention-grey', effectiveTheme) || '#161616'
        Chart.defaults.global.defaultFontColor = fontColor
        this.chart.options.scales.xAxes[0].gridLines.color = this.getHexaFromToken('border-default-grey', effectiveTheme)
        this.chart.options.scales.xAxes[0].gridLines.zeroLineColor = this.getHexaFromToken('border-default-grey', effectiveTheme)
        this.chart.options.scales.xAxes[0].ticks.fontColor = fontColor

        this.chart.options.scales.yAxes[0].gridLines.color = this.getHexaFromToken('border-default-grey', effectiveTheme)
        this.chart.options.scales.yAxes[0].gridLines.zeroLineColor = this.getHexaFromToken('border-default-grey', effectiveTheme)
        this.chart.options.scales.yAxes[0].ticks.fontColor = fontColor
  
        this.loadColors()
        if (theme === 'light') {
          this.colorPrecisionBar = 'blue-ecume'
          this.colorBox = '#eeeeee'
        } else {
          this.colorPrecisionBar = '#FFFFFF'
          this.colorBox = '#2f2f2f'
        }
        for (let i = 0; i < this.yparse.length; i++) {
          const dataForDataset = this.chart.data.datasets[i].data || []
          const colors = dataForDataset.map(() =>
            this.hexToRgba(this.colorParse[i], 1)
          )
          this.chart.data.datasets[i].borderColor = colors
          this.chart.data.datasets[i].backgroundColor = colors
          this.chart.data.datasets[i].hoverBorderColor = colors
          this.chart.data.datasets[i].hoverBackgroundColor = colors
        }
        for (const box of Object.entries(this.chart.annotation.elements)) {
          const key = box[0]
          this.chart.annotation.elements[key].options.backgroundColor = this.colorBox
          this.chart.annotation.elements[key].options.borderColor = this.colorBox
        }
        if (this.trendLineParse.length > 0) {
          this.trendLineColor = (this.colorParse.length > 0)
            ? this.colorParse[0]
            : this.getHexaFromName('beige-gris-galet')
        }
        if (this.targetSegmentParse || this.targetTrajectoryParse) {
          this.targetSegmentColor = this.getHexaFromName(this.resolveTargetTokenForCanvas())
        }
        this.chart.update(0)
      }
    },
    created () {
      this.chartId = 'myChart' + Math.floor(Math.random() * (10000000))
      this.widgetId = 'widget' + Math.floor(Math.random() * (10000000))
    },
    mounted () {
      document.getElementById(this.widgetId).offsetWidth > 486 ? this.display = 'big' : this.display = 'small'
      this.viewportSmall = document.documentElement.clientWidth < 767
      this.createChart()
      const element = document.documentElement // Reference à l'element <html> du DOM
      element.addEventListener('dsfr.theme', (e) => {
        this.changeColors(e.detail.theme)
      })
      addEventListener('resize', (event) => {
        this.viewportSmall = document.documentElement.clientWidth < 767
      })
    },
    beforeUpdate () {
      this.resetData()
      this.createChart()
      const element = document.documentElement
      this.changeColors(element.getAttribute('data-fr-theme'))
    }
  }
  </script>
  <style scoped lang="scss">
  .widget_container {
    .ml-lg {
      margin-left: 0;
    }
    @media (min-width: 62em) {
      .ml-lg {
        margin-left: 3rem;
      }
    }
    .r_col {
      align-self: center;
    }
    .bar-chart-legend {
      margin-top: 0.25rem;
      padding-bottom: 0.125rem;
    }
    .bar-chart-legend-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.65rem 1.35rem;
    }
    .bar-chart-legend-row--secondary {
      margin-top: 0.5rem;
    }
    .bar-chart-legend-item {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 0.35rem;
      flex-shrink: 0;
    }
    .bar-chart-legend-dash {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      flex-shrink: 0;
    }
    .bar-chart-legend-label {
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.25rem;
    }
    .legende_dot {
      min-width: 0.8rem;
      width: 0.8rem;
      height: 0.8rem;
      background-color: #000091;
      display: inline-block;
      flex-shrink: 0;
    }
    .legende_dot_circle {
      min-width: 0.8rem;
      width: 0.8rem;
      height: 0.8rem;
      border-radius: 50%;
      background-color: #000091;
      display: inline-block;
      flex-shrink: 0;
    }
    .legende_dash_line1 {
      min-width: 0.35rem;
      width: 0.35rem;
      height: 0.2rem;
      border-radius: 0;
      display: inline-block;
      flex-shrink: 0;
    }
    .legende_dash_line2 {
      min-width: 0.35rem;
      width: 0.35rem;
      height: 0.2rem;
      border-radius: 0;
      display: inline-block;
      margin-left: 0.1rem;
      flex-shrink: 0;
    }
    .chart canvas {
      max-width: 100%;
    }
    .linechart_tooltip {
      opacity: 0;
      width: 14rem;
      height: auto;
      background-color: white;
      position: fixed;
      z-index: 999;
      box-shadow: 0 2px 6px 0 rgba(0, 0, 18, 0.16);
      text-align: left;
      pointer-events: none;
      font-size: 0.75rem;
      .tooltip_header {
        width: 100%;
        height: 1.75rem;
        background-color: #f6f6f6;
        color: #6b6b6b;
        padding-left: 0.75rem;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
      }
      .tooltip_body {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
        padding-top:0.25rem;
        line-height: 1.67;
        .tooltip_dot {
          min-width: 0.7rem;
          width: 0.7rem;
          height: 0.7rem;
          background-color: #000091;
          display: inline-block;
          margin-top: 0.25rem;
          margin-right: 0.25rem;
        }
        .tooltip_place {
          color: #242424;
        }
        .tooltip_value {
          color: #242424;
          font-weight: bold;
        }
      }
    }
  }
  </style>
  