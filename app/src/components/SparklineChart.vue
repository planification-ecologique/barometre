<template>
  <div class="sparkline-container">
    <canvas ref="canvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
export default {
  name: 'SparklineChart',
  props: {
    values: {
      type: Array,
      default: () => []
    },
    width: {
      type: Number,
      default: 120
    },
    height: {
      type: Number,
      default: 40
    },
    barColor: {
      type: String,
      default: '#6a6af4'
    },
    trendColor: {
      type: String,
      default: '#666'
    },
    targetValue: {
      type: Number,
      default: null
    }
  },
  mounted() {
    this.$nextTick(() => this.draw())
  },
  watch: {
    values: {
      handler() {
        this.$nextTick(() => this.draw())
      },
      deep: true
    }
  },
  methods: {
    draw() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1
      canvas.width = this.width * dpr
      canvas.height = this.height * dpr
      canvas.style.width = this.width + 'px'
      canvas.style.height = this.height + 'px'
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, this.width, this.height)

      const vals = (this.values || []).filter(v => v !== null && v !== undefined && !isNaN(v))
      if (vals.length === 0) return

      const max = Math.max(...vals, this.targetValue || 0) * 1.1 || 1
      const min = Math.min(0, Math.min(...vals))
      const range = max - min || 1

      const barWidth = Math.max(2, (this.width - 4) / vals.length - 1)
      const gap = 1
      const startX = 2

      // Draw bars
      vals.forEach((val, i) => {
        const barHeight = ((val - min) / range) * (this.height - 6)
        const x = startX + i * (barWidth + gap)
        const y = this.height - 3 - barHeight

        ctx.fillStyle = this.barColor
        ctx.fillRect(x, y, barWidth, barHeight)
      })

      // Draw trend line (simple linear regression)
      if (vals.length >= 2) {
        const n = vals.length
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
        for (let i = 0; i < n; i++) {
          sumX += i
          sumY += vals[i]
          sumXY += i * vals[i]
          sumXX += i * i
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
        const intercept = (sumY - slope * sumX) / n

        ctx.beginPath()
        ctx.strokeStyle = this.trendColor
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 3])

        for (let i = 0; i < n; i++) {
          const trendVal = intercept + slope * i
          const barHeight = ((trendVal - min) / range) * (this.height - 6)
          const x = startX + i * (barWidth + gap) + barWidth / 2
          const y = this.height - 3 - barHeight
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw target dot
      if (this.targetValue !== null && this.targetValue !== undefined) {
        const targetH = ((this.targetValue - min) / range) * (this.height - 6)
        const targetX = startX + (vals.length) * (barWidth + gap) + barWidth / 2
        const targetY = this.height - 3 - targetH

        ctx.beginPath()
        ctx.arc(targetX, targetY, 3, 0, Math.PI * 2)
        ctx.fillStyle = '#000091'
        ctx.fill()
      }
    }
  }
}
</script>

<style scoped>
.sparkline-container {
  display: inline-flex;
  align-items: center;
  min-width: 120px;
  min-height: 40px;
}

.sparkline-container canvas {
  display: block;
}
</style>
