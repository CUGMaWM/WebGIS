<script setup>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Circle, Text, Style } from 'ol/style.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import GeoJSON from 'ol/format/GeoJSON'
import { defineProps, onMounted } from 'vue'
import { GeometryCollection } from 'ol/geom'

// 定义组件的属性
const props = defineProps({
  viewConf: { type: Object, default: () => ({}) },
  defLyrs: { type: Array, default: () => ['vec_c'] }
})
// 在组件挂载后初始化地图
onMounted(() => {
  createMap()
})
// 创建地图函数
function createMap() {
  // 用传入的view配置覆盖默认配置
  const viewOpts = Object.assign(
    {
      projection: 'EPSG:4326',

      // 地大中心
      center: [114.61296, 30.46099],
      zoom: 17.5
    },
    props.viewConf
  )
  const layerOptions = [
    {
      key: 'vec_c',
      title: '天地图',
      option: {
        projection: 'EPSG:4326',
        url: `http://t{0-7}.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=b387b606afd9c346236f767123461927`
      }
    }
  ]
  const map = new Map({
    // 3.1-设置地图的dom容器
    target: 'mapDom',

    // 3.2-设置地图的视图配置，projection默认是EPSG:3857（Web墨卡托平面坐标系）
    view: new View(viewOpts),

    // 3.3-创建显示的图层序列
    layers: layerOptions
      .filter((item) => props.defLyrs.includes(item.key))
      .map((item) => {
        return new TileLayer({
          properties: {
            name: item.key,
            title: item.title
          },
          source: new XYZ(item.option)
        })
      })
  })
  window.map = map
}
</script>

<script>
export default {
  name: 'MapComponent',
  data() {
    return {
      map: null,
      drawing: false,
      lineCoords: [],
      vectorLayerSet: []
    }
  },
  methods: {
    mounted() {
      this.drawing = false
    },
    startDrawing() {
      if (window.map == null) return
      this.map = window.map
      this.drawing = !this.drawing
      this.lineCoords = []
      this.map.on('click', this.handleMapClick)
    },
    showInputDialog(message) {
      const inputValue = window.prompt(message)
      return inputValue !== null ? inputValue : ''
    },
    handleMapClick(event) {
      if (!this.drawing) return

      const pointCoor = event.coordinate
      let pName = this.showInputDialog('点名:')
      // 创建一个点Feature对象
      const pStyle = new Style({
        fill: new Fill({ color: 'rgba(168, 172, 38, 0.6)' }),
        stroke: new Stroke({ color: '#319FD3', width: 1 }),
        image: new Circle({
          radius: 5,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'yellow' })
        }),
        text: new Text({
          font: '12px Calibri,sans-serif',
          offsetY: -15,
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          text: pName
        })
      })

      let markedPoint = new Point(pointCoor)
      const pointFeature = new Feature(markedPoint)
      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [pointFeature]
        }),
        style: pStyle
      })

      this.vectorLayerSet.push(pointFeature)
      this.map.addLayer(vectorLayer)
    },

    clearDrawing() {
      this.vectorLayer.getSource().clear()
      this.lineCoords = []
      this.polygonFeature = null
      this.drawing = false
      this.clearLayers()
    },
    clearLayers() {
      let t = 0
      if (window.map == null) t = 100
      setTimeout(() => {
        const layers = window.map.getLayers()
        while (layers.getLength() > 1) {
          layers.pop()
        }
      }, t)
    },
    exportPointsToJSON() {
      if (this.vectorLayerSet.length < 1) {
        alert('无标注要素!')
        return
      }
      const feature = new Feature({
        geometry: new GeometryCollection(
          this.vectorLayerSet.map((feature) => feature.getGeometry())
        ),
        name: 'MarkedSet'
      })

      const geoJsonFormat = new GeoJSON()
      const geoJsonString = geoJsonFormat.writeFeatures([feature])

      const blob = new Blob([geoJsonString], { type: 'application/json' }) // 创建 Blob 对象
      const url = URL.createObjectURL(blob) // 创建下载链接
      const link = document.createElement('a') // 创建 <a> 元素
      link.href = url
      link.download = 'points.json' // 设置下载文件的名称
      link.click()
      // 清理资源
      URL.revokeObjectURL(url)
    },
    goMain() {
      this.$router.push({ path: '/webMap' })
    }
  }
}
</script>

<template>
  <div id="mapDom" class="map"></div>

  <div class="control">
    <el-button @click="startDrawing">开始绘制</el-button>
    <el-button @click="clearDrawing">清除区域</el-button>
    <el-button @click="goMain">主界面</el-button>
    <el-button @click="exportPointsToJSON">导出为JSON</el-button>
  </div>
</template>

<style>
.map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.control {
  position: absolute;
  left: 80px;
  top: 10px;
}
</style>
