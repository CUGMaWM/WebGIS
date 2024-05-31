<script>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke, Fill } from 'ol/style'
import Feature from 'ol/Feature'
import Polygon from 'ol/geom/Polygon'
import { getArea } from 'ol/sphere'

export default {
  name: 'MapComponent',
  data() {
    return {
      map: null,
      drawing: false,
      lineCoords: [],
      polygonFeature: null,
      vectorLayer: null
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
              url: 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=8&lstyle=7&x={x}&y={y}&z={z}'
            })
          })
        ],
        view: new View({
          center: [12758612.973162018, 3562849.0216611675], //默认中心位置
          zoom: 17.5 //默认缩放级别
        })
      })
      this.map = map
      this.vectorLayer = new VectorLayer({
        source: new VectorSource()
      })
      this.map.addLayer(this.vectorLayer)
    },
    startDrawing() {
      this.drawing = !this.drawing
      this.lineCoords = []
      this.polygonFeature = null

      this.map.on('click', this.handleMapClick)
      this.map.on('pointermove', this.handlePointerMove)
      this.map.once('pointermove', this.handleFirstPointerMove)
    },
    handleMapClick(event) {
      if (!this.drawing) return

      const coords = event.coordinate
      this.lineCoords.push(coords)

      if (this.polygonFeature) {
        this.vectorLayer.getSource().removeFeature(this.polygonFeature)
      }

      const polygonGeom = new Polygon([this.lineCoords])
      this.polygonFeature = new Feature({
        geometry: polygonGeom
      })

      const polygonStyle = new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      })

      this.polygonFeature.setStyle(polygonStyle)
      this.vectorLayer.getSource().addFeature(this.polygonFeature)
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
    calculateArea() {
      if (this.lineCoords.length < 3) {
        alert('至少需要三个点来计算面积！')
        return
      }

      // 闭合多边形
      this.lineCoords.push(this.lineCoords[0])

      const polygonGeom = new Polygon([this.lineCoords])
      const areaInSquareMeters = getArea(polygonGeom)
      const totalAreaInSquareMeters = areaInSquareMeters.toFixed(2) + ' 平方米'

      // 更新多边形样式
      if (this.polygonFeature) {
        this.vectorLayer.getSource().removeFeature(this.polygonFeature)
      }
      this.polygonFeature = new Feature({
        geometry: polygonGeom
      })

      const polygonStyle = new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        })
      })

      this.polygonFeature.setStyle(polygonStyle)
      this.vectorLayer.getSource().addFeature(this.polygonFeature)

      alert('区域的总面积为: ' + totalAreaInSquareMeters)
      this.drawing = false
    },
    clearDrawing() {
      location.reload()
    },
    goMain() {
      this.$router.push({ path: '/webMap' })
    },
    goLine() {
      this.$router.push({ path: '/calLine' })
    }
  }
}
</script>

<template>
  <div ref="map" class="map"></div>
  <div class="control">
    <el-button @click="startDrawing">开始绘制</el-button>
    <el-button @click="calculateArea" :disabled="!drawing">计算面积</el-button>
    <el-button @click="clearDrawing">清除区域</el-button>
    <el-button @click="goMain">主界面</el-button>
    <el-button @click="goLine">线段量算</el-button>
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
