<template>
  <div class="container" id = "container">
    <div v-for="(product, productIndex) in products" :key="productIndex" class="rectangle" :id="'div_' + product.name">
      <span class="x-label">{{ product.name }}</span>
    </div>
<br>
    <div class="graph">
      <div v-for="(value, index) in this.zparse" :key="index" class="graph-item" :style="{ flexBasis: getFlexBasis() }">
        <div :style="{ backgroundColor: getColor(index) }" class="graph-color"></div>
        <div class="graph-label">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      xparse: [],
      yparse: [],
      zparse: [],
      colors: ['darkorange','brown', 'cadetblue', 'lavender', 'lightblue', 'navy', 'peachpuff', 'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'burlywood', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin']      
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
    z: {
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
    }
  },
  computed: {
    products () {
      return this.xparse.map((name, index) => ({
        name,
        quantity: this.yparse[index]
      }))
    }
  },
  methods: {
    resetData () {
      this.xparse = []
      this.yparse = []
      this.zparse = []
    },
    adddiv () {
      for (let i = 0; i < this.xparse.length; i++) {
        const parentElement = document.getElementById('div_' + this.xparse[i])
        for (let j = 0; j < this.yparse[i].length; j++) {
          for (let k = 0; k < this.yparse[i][j]; k++) {
            const div = document.createElement('div')
            div.id = 'square_' + this.xparse[i] + '_' + j + '_' + k
            div.className = 'square'
            div.style.backgroundColor = this.getColor(j)
            div.style.width = '8px'
            div.style.height = '8px'
            div.style.display = 'inline-grid'
            div.style.margin = '1px'
            div.style.borderRadius = '15px'
            div.style.verticalAlign = 'top'
            div.style.direction = 'ltr'
            parentElement.appendChild(div)
          }
        }
      }
    },
    getColor (index) {
      return this.colors[index % this.colors.length]
    },
    getData () {
      this.xparse = JSON.parse(this.x)
      this.yparse = JSON.parse(this.y)
      this.zparse = JSON.parse(this.z)
    },
    getFlexBasis() {
      return this.zparse.length > 3 ? '43%' : '100%';
    }
  },
  mounted () {
    this.getData()
    this.$nextTick(() => {
      this.adddiv()
    })
  }
}
</script>
<style scoped>
.rectangle {
  display: inline-block;
  max-width: 95px;
  margin: 2.5px;
  direction: rtl;
  transform: rotate(180deg);
}
.container {
  width: 175%;
}
.square {
  width: 15px;
  height: 15px;
  border-radius: 15px;
  display: inline-block;
  margin: 2px;
}
.x-axis {
  border-top: 2px solid black;
  max-width: 100px;
  margin: 10px 0;
}
.x-label {
  font-size: 10px;
  display: flex;
  width: 10px;
  height: 10px;
  margin: 40px;
  justify-content: center;
  transform: rotate(180deg)
  /* transform: rotate(-225deg); */
}
.graph {
  display: flex;
  align-items: left;
  margin-top: 80px;
  flex-wrap: wrap;
  max-width: 80%;
}
.graph-item {
  display: flex;
  align-items: center;
  /* margin-right: 10px; */
}
.graph-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 5px;
}
.graph-label {
  font-size: 14px;
}

</style>
