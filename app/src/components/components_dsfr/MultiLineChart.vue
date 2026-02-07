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
        
        <!-- Legend row -->
        <div class="fr-mt-3v legend-row" :style="{'margin-left': isSmall ? '0px' : style}">
          <div v-for="(item, index) in nameParse" :key="item" class="flex legend-item" @click="ChangeShowLine(index)">
            <span class="legende_dot" v-bind:style="{'background-color': colorParse[index], 'opacity': opacity[index]}"></span>
            <p class='fr-text--sm fr-text--bold fr-ml-1w fr-mb-0' :style="{'opacity': opacity[index]}">
              {{capitalize(nameParse[index])}}
            </p>
          </div>
          
          <div v-for="(item2, index2) in hlineNameParse" :key="item2" class="flex legend-item">
            <span class="legende_dash_line1" v-bind:style="{'background-color': hlineColorParse[index2]}"></span>
            <span class="legende_dash_line2" v-bind:style="{'background-color': hlineColorParse[index2]}"></span>
            <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">{{ capitalize(hlineNameParse[index2]) }}</p>
          </div>
          
          <div v-for="(item3, index3) in vlineNameParse" :key="item3" class="flex legend-item">
            <span class="legende_dash_line1" v-bind:style="{'background-color': vlineColorParse[index3]}"></span>
            <span class="legende_dash_line2" v-bind:style="{'background-color': vlineColorParse[index3]}"></span>
            <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">{{ capitalize(vlineNameParse[index3]) }}</p>
          </div>
        </div>
        
        <div v-if="date!==undefined" class="flex fr-mt-1w" :style="{'margin-left': isSmall ? '0px' : style}">
          <p class="fr-text--xs">Mise à jour : {{date}}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Chart } from 'chart.js'
import { mixin } from '@/utils.js'
export default {
  name: 'MultiLineChart',
  mixins: [mixin],
  data () {
    return {
      widgetId: '',
      chartId: '',
      legendLeftMargin: 100,
      display: '',
      datasets: [],
      xAxisType: 'category',
      labels: undefined,
      opacity: [1, 1],
      showLine: [],
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
      ymax: 0,
      pointOpacityParse: [],
      colorPrecisionBar: '#161616',
      colorHover: [],
      isSmall: false
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
      }
  },
  computed: {
    style () {
      return this.legendLeftMargin + 'px'
    }
  },
  methods: {
    resetData () {
      this.legendLeftMargin = 100
      this.display = ''
      this.datasets = []
      this.xAxisType = ''
      this.labels = undefined
      this.opacity = []
      this.showLine = []
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
      this.ymax = 0
      this.colorPrecisionBar = ''
      this.colorHover = []
    },
    getData () {
      const self = this
      // Récupération des paramètres
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
        self.showLine.push(true)
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
      // Cas ou x est numérique
      if (typeof self.xparse[0][0] === 'number') {
        const allX = []
        self.xparse.forEach(function (xj, j) {
          const dj = []
          const xsort = xj.map((a) => a).sort((a, b) => a - b)
          xsort.forEach(function (k) {
            const index = xj.findIndex((element) => element === k)
            dj.push({
              x: k,
              y: self.yparse[j][index]
            })
            if (!allX.includes(k)) {
              allX.push(k)
            }
          })
          data.push(dj)
        })
        self.labels = undefined
        self.xAxisType = 'linear'
      } else {
        // Cas ou x est non numérique
        data = self.yparse
        self.labels = self.xparse[0]
        self.xAxisType = 'category'
      }

      // Set ymax
      self.ymax = Math.max.apply(null, self.hlineParse)

      // Tracé de la courbe
      data.forEach(function (dj, j) {
        const colorPerPoint = dj.map(function (_, i) {
          let alpha = self.getExtrapolationAlpha()
          if (Array.isArray(self.pointOpacityParse)) {
            if (Array.isArray(self.pointOpacityParse[0])) {
              alpha = (self.pointOpacityParse[j] && self.pointOpacityParse[j][i] !== undefined) ? self.pointOpacityParse[j][i] : self.getExtrapolationAlpha()
            } else {
              alpha = (self.pointOpacityParse[i] !== undefined) ? self.pointOpacityParse[i] : self.getExtrapolationAlpha()
            }
          }
          return self.hexToRgba(self.colorParse[j], alpha)
        })
        self.datasets.push({
          data: dj,
          fill: false,
          // Make the default line fully transparent; we'll custom-draw per-segment below
          borderColor: 'rgba(0,0,0,0)',
          type: 'line',
          // Allow the visual line to be continuous across null points;
          // the actual segment rendering is handled in afterDatasetDraw.
          spanGaps: true,
          pointRadius: 4,
          pointStyle: 'circle',
          pointBackgroundColor: colorPerPoint,
          pointBorderColor: colorPerPoint,
          pointHoverBackgroundColor: self.colorHover[j],
          pointHoverBorderColor: self.colorHover[j],
          pointHoverRadius: 6,
          borderWidth: 3,
          lineTension: 0.2
        })
      })
    },
    createChart () {
      Chart.defaults.global.defaultFontFamily = 'Marianne'
      Chart.defaults.global.defaultFontSize = 12
      Chart.defaults.global.defaultLineHeight = 1.66

      this.getData()
      const self = this
      const ctx = document.getElementById(self.chartId).getContext('2d')
      this.chart = new Chart(ctx, {
        data: {
          labels: self.labels,
          datasets: self.datasets
        },
        plugins: [{
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
          // Custom per-segment line drawing that:
          // - skips null / missing points
          // - connects the last valid point to the next valid one (even if there are gaps in between)
          // - uses the opacity of the destination point to style the segment
          afterDatasetDraw: function (chart, args, options) {
            const dsIndex = args.index
            if (!self.showLine[dsIndex]) return
            const meta = chart.getDatasetMeta(dsIndex)
            const points = meta.data || []
            if (!points || points.length < 2) return

            const ctx = chart.ctx
            ctx.save()
            ctx.lineWidth = (chart.config.data.datasets[dsIndex].borderWidth) || 3
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'

            let lastValid = null
            for (let i = 0; i < points.length; i++) {
              const view = points[i] && points[i]._view
              if (!view || view.y === null || Number.isNaN(view.y)) {
                // Missing point: break the segment, wait for the next valid one
                continue
              }

              if (lastValid) {
                // Determine alpha from the current point index i
                let alpha = self.getExtrapolationAlpha()
                try {
                  if (Array.isArray(self.pointOpacityParse)) {
                    if (Array.isArray(self.pointOpacityParse[0])) {
                      alpha = (self.pointOpacityParse[dsIndex] && self.pointOpacityParse[dsIndex][i] !== undefined)
                        ? self.pointOpacityParse[dsIndex][i]
                        : self.getExtrapolationAlpha()
                    } else {
                      alpha = (self.pointOpacityParse[i] !== undefined) ? self.pointOpacityParse[i] : self.getExtrapolationAlpha()
                    }
                  }
                } catch (e) {
                  alpha = self.getExtrapolationAlpha()
                }

                const stroke = self.hexToRgba(self.colorParse[dsIndex], alpha)
                ctx.strokeStyle = stroke
                // Dashed for non-fully-opaque (projection/target), solid for measured
                if (Number(alpha) < 1) {
                  ctx.setLineDash([6, 4])
                } else {
                  ctx.setLineDash([])
                }
                ctx.beginPath()
                ctx.moveTo(lastValid.x, lastValid.y)
                ctx.lineTo(view.x, view.y)
                ctx.stroke()
              }

              // Update last valid point
              lastValid = view
            }
            ctx.restore()
          }
        },
        {
          afterDraw: function (chart, args, options) {
            if (chart.tooltip._active !== undefined) {
              if (chart.tooltip._active.length !== 0) {
                const x = chart.tooltip._active[0]._model.x
                let y
                const index = chart.tooltip._active[0]._index
                const yAxis = chart.scales['y-axis-0']
                const xAxis = chart.scales['x-axis-0']
                const ctx = chart.ctx
                ctx.save()
                ctx.beginPath()
                ctx.moveTo(x, yAxis.top)
                ctx.lineTo(x, yAxis.bottom)
                ctx.lineWidth = '1'
                ctx.strokeStyle = self.colorPrecisionBar
                ctx.setLineDash([10, 5])
                ctx.stroke()
                ctx.restore()

                self.yparse.forEach(function (yj, j) {
                  const v = yj[index]
                  if (v === null || v === undefined || Number.isNaN(v)) return
                  y = yAxis.getPixelForValue(v)
                  ctx.save()
                  ctx.beginPath()
                  ctx.moveTo(xAxis.left, y)
                  ctx.lineTo(xAxis.right, y)
                  ctx.lineWidth = '1'
                  ctx.strokeStyle = self.colorPrecisionBar
                  ctx.setLineDash([10, 5])
                  ctx.stroke()
                  ctx.restore()
                })
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
          scales: {
            xAxes: [{
              type: self.xAxisType,
              gridLines: {
                zeroLineColor: '#DDDDDD',
                drawOnChartArea: false,
                color: '#DDDDDD',
                lineWidth: 1
              },
              ticks: {
                display: true,
                fontColor: '#161616',
                fontSize: 12,
                callback: function (value) {
                  if (self.formatdate) {
                    return value.toString().substring(5, 7) + '/' + value.toString().substring(0, 4)
                  } else {
                    return value
                  }
                }
              }
            }],
            yAxes: [{
              gridLines: {
                drawTicks: false,
                zeroLineColor: '#DDDDDD',
                color: '#DDDDDD',
                borderDash: [3],
                lineWidth: 1
              },
              ticks: {
                padding: 8,
                autoSkip: true,
                maxTicksLimit: 5,
                suggestedMin: 0,
                suggestedMax: self.ymax,
                fontColor: '#161616',
                fontSize: 12,
                callback: function (value, index, values) {
                  if (value >= 1000000000 || value <= -1000000000) {
                    return value / 1e9 + 'B'
                  } else if (value >= 1000000 || value <= -1000000) {
                    return value / 1e6 + 'M'
                  } else if (value >= 1000 || value <= -1000) {
                    return value / 1e3 + 'K'
                  }
                  return value
                }
              },
              afterFit: function (axis) {
                self.legendLeftMargin = axis.width
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
                  if (self.showLine[i]) {
                    if (self.xAxisType === 'linear') {
                      const index = self.xparse[i].indexOf(tooltipItems.xLabel)
                      if (index !== -1) {
                        const v = self.yparse[i][index]
                        label.push((v === null || v === undefined || Number.isNaN(v)) ? undefined : v)
                      } else {
                        label.push(undefined)
                      }
                    } else {
                      const v = set.data[tooltipItems.index]
                      label.push((v === null || v === undefined || Number.isNaN(v)) ? undefined : v)
                    }
                  }
                })
                return label
              },
              title: function (tooltipItems) {
                return tooltipItems[0].label
              },
              labelTextColor: function (tooltipItems) {
                const colors = []
                self.showLine.forEach(function (show, i) {
                  if (show) {
                    colors.push(self.colorParse[i])
                  }
                })
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
                divDate.innerHTML = titleLines[0]

                const color = tooltipModel.labelTextColors[0]
                const divValue = self.$el.querySelector('.tooltip_value')

                const nodeName = self.$el.querySelector('.tooltip_dot').attributes[0].nodeName
                divValue.innerHTML = ''
                bodyLines[0].forEach(function (line, i) {
                  if (line !== undefined && line !== null && !Number.isNaN(line)) {
                    const seriesLabel = (self.nameParse && self.nameParse[i]) ? self.capitalize(self.nameParse[i]) : ''
                    const labelText = seriesLabel ? seriesLabel : ''
                    // Order: color dot – value – label
                    divValue.innerHTML +=
                      '<span ' + nodeName + '= "" class="tooltip_dot" style="background-color:' + color[i] + '"></span>' +
                      ' ' + line +
                      (labelText ? ' – ' + labelText : '') +
                      '<br>'
                  }
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
    ChangeShowLine (index) {
      const self = this
      this.showLine[index] = !this.showLine[index]
      this.chart.data.datasets[index].showLine = this.showLine[index]
      this.opacity.length = 0
      this.showLine.forEach(function (show, j) {
        if (show) {
          self.opacity.push(1)
        } else {
          self.opacity.push(0.3)
        }
      })
      this.chart.update(0)
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
          this.vlineColorParse.push(this.getHexaFromName('brown-cafe-creme'))
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
    },
    changeColors (theme) {
      Chart.defaults.global.defaultFontColor = this.getHexaFromToken('text-mention-grey', theme)
      this.chart.options.scales.xAxes[0].gridLines.color = this.getHexaFromToken('border-default-grey', theme)
      this.chart.options.scales.xAxes[0].gridLines.zeroLineColor = this.getHexaFromToken('border-default-grey', theme)

      this.chart.options.scales.yAxes[0].gridLines.color = this.getHexaFromToken('border-default-grey', theme)
      this.chart.options.scales.yAxes[0].gridLines.zeroLineColor = this.getHexaFromToken('border-default-grey', theme)

      this.loadColors()
      if (theme === 'light') {
        this.colorPrecisionBar = '#161616'
      } else {
        this.colorPrecisionBar = '#FFFFFF'
      }
      for (let i = 0; i < this.yparse.length; i++) {
        const dataForDataset = this.chart.data.datasets[i].data || []
        const extrapolationAlpha = this.getExtrapolationAlpha()
        const colorPerPoint = dataForDataset.map((_, idx) => {
          let alpha = extrapolationAlpha
          if (Array.isArray(this.pointOpacityParse)) {
            if (Array.isArray(this.pointOpacityParse[0])) {
              alpha = (this.pointOpacityParse[i] && this.pointOpacityParse[i][idx] !== undefined) ? this.pointOpacityParse[i][idx] : extrapolationAlpha
            } else {
              alpha = (this.pointOpacityParse[idx] !== undefined) ? this.pointOpacityParse[idx] : extrapolationAlpha
            }
          }
        
          return this.hexToRgba(this.colorParse[i], alpha)
        })
        // Keep the dataset stroke invisible; custom plugin draws per-segment lines
        this.chart.data.datasets[i].borderColor = 'rgba(0,0,0,0)'
        this.chart.data.datasets[i].pointBackgroundColor = colorPerPoint
        this.chart.data.datasets[i].pointBorderColor = colorPerPoint
        this.chart.data.datasets[i].pointHoverBackgroundColor = this.colorHover[i]
        this.chart.data.datasets[i].pointHoverBorderColor = this.colorHover[i]
      }
      this.chart.update(0)
    }
  },
  created () {
    this.chartId = 'myChart' + Math.floor(Math.random() * (1000))
    this.widgetId = 'widget' + Math.floor(Math.random() * (1000))
  },
  mounted () {
    document.getElementById(this.widgetId).offsetWidth > 486 ? this.display = 'big' : this.display = 'small'
    this.createChart()
    const element = document.documentElement // Reference à l'element <html> du DOM
    element.addEventListener('dsfr.theme', (e) => {
      this.changeColors(e.detail.theme)
    })
    addEventListener('resize', (event) => {
      this.isSmall = document.documentElement.clientWidth < 767
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
    .flex {
      display: flex;
      .legende_dot {
        min-width: 0.8rem;
        width: 0.8rem;
        height: 0.8rem;
        min-width: 0.8rem;
        background-color: #000091;
        display: inline-block;
        margin-top: 0.25rem;
        margin-left: 0;
      }
      .legende_dash_line1{
        min-width: 0.35rem;
        width: 0.35rem;
        height: 0.2rem;
        border-radius: 0%;
        display: inline-block;
        margin-top: 0.6rem;
      }
      .legende_dash_line2{
        min-width: 0.35rem;
        width: 0.35rem;
        height: 0.2rem;
        border-radius: 0%;
        display: inline-block;
        margin-top: 0.6rem;
        margin-left: 0.1rem;
      }
    }
    
    .legend-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1.5rem;
      
      .legend-item {
        margin-bottom: 0.25rem;
        cursor: pointer;
      }
    }
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
