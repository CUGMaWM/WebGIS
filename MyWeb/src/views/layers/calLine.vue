<script>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke } from 'ol/style'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import { getLength } from 'ol/sphere' // 引入ol/sphere模块

export default {
  name: 'MapComponent',
  data() {
    return {
      map: null,
      drawing: false,
      lineCoords: [],
      lineFeature: null
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      const map = new Map({
        target: this.$refs.map,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
          })
        ],
        view: new View({
          center: [12758612.973162018, 3562849.0216611675], //默认中心位置
          zoom: 17.5 //默认缩放级别
        })
      })
      this.map = map
    },
    startDrawing() {
      this.drawing = true
      this.lineCoords = []
      this.lineFeature = null

      this.map.on('click', this.handleMapClick)
      this.map.on('pointermove', this.handlePointerMove)
      this.map.once('pointermove', this.handleFirstPointerMove)
    },
    handleMapClick(event) {
      if (!this.drawing) return

      const coords = event.coordinate
      this.lineCoords.push(coords)

      if (this.lineFeature) {
        this.map.removeLayer(this.lineFeature)
      }

      const lineGeom = new LineString(this.lineCoords)
      this.lineFeature = new Feature({
        geometry: lineGeom
      })

      const lineStyle = new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2
        })
      })

      this.lineFeature.setStyle(lineStyle)

      const vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: [this.lineFeature]
        })
      })

      this.map.addLayer(vectorLayer)
    },
    handlePointerMove(event) {
      if (!this.drawing) return

      const coords = event.coordinate

      if (this.lineCoords.length > 0) {
        const lastCoord = this.lineCoords[this.lineCoords.length - 1]
        const distance = Math.sqrt(
          Math.pow(coords[0] - lastCoord[0], 2) + Math.pow(coords[1] - lastCoord[1], 2)
        )

        // Display distance between last point and current pointer position
        console.log('Distance:', distance)
      }
    },
    handleFirstPointerMove() {
      this.map.un('pointermove', this.handlePointerMove)
    },
    calculateLength() {
      if (this.lineCoords.length < 2) {
        alert('至少需要两个点来计算长度！')
        return
      }

      const lineGeom = new LineString(this.lineCoords)
      // 使用getLength计算实际地理距离
      const lengthInMeters = getLength(lineGeom)
      const totalLengthInMeters = lengthInMeters.toFixed(2) + ' 米'
      alert('折线段的总长度为: ' + totalLengthInMeters)
    },
    clearDrawing() {
      this.map.getLayers().forEach((layer) => {
        if (layer instanceof VectorLayer) {
          this.map.removeLayer(layer)
        }
      })

      this.lineCoords = []
      this.lineFeature = null
      this.drawing = false
    },
    goMain() {
      this.$router.push({ path: '/webMap' })
    },
    goArea() {
      this.$router.push({ path: '/calArea' })
    }
  }
}
</script>

<template>
  <div ref="map" class="map"></div>
  <div class="control">
    <el-button @click="startDrawing">开始绘制</el-button>
    <el-button @click="calculateLength" :disabled="!drawing">计算长度</el-button>
    <el-button @click="clearDrawing">清除线段</el-button>
    <el-button @click="goMain">主界面</el-button>
    <el-button @click="goArea">面积量算</el-button>
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
