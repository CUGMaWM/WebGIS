<script setup>
import { createApp } from 'vue'
import { defineProps, onMounted } from 'vue'
import { Fill, Style } from 'ol/style'
import Heatmap from 'ol/layer/Heatmap'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import GeoJSONFormat from 'ol/format/GeoJSON'
import TileLayer from 'ol/layer/Tile.js'
import XYZ from 'ol/source/XYZ.js'
import Map from 'ol/Map'
import View from 'ol/View'
import Overlay from 'ol/Overlay'
import ComEchart from './ComEchart.vue'

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
  methods: {
    data() {
      return {
        type: 1 // 将 type 属性添加到组件的 data
      }
    },
    goBack() {
      this.$router.push({ path: '/' })
    },
    upLoadJSON(type) {
      this.type = type
      this.$refs.fileRef.dispatchEvent(new MouseEvent('click')) //弹出选择本地文件
    },
    //读取JSON并绘制部分
    handleFileUpload(event) {
      // 处理文件上传逻辑
      this.clearLayers()
      const file = event.target.files[0]
      const extension = file.name.split('.').pop().toLowerCase()
      if (!(extension == 'json' || extension == 'js')) {
        alert('文件格式不正确(json/js)!')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const fileData = event.target.result
        try {
          const jsonData = JSON.parse(fileData)
          switch (this.type) {
            case 0:
              this.makeHeatMap(jsonData)
              break
            case 1:
              this.makeStatMap(jsonData)
              break
            default:
              break
          }
        } catch (error) {
          console.error('解析 JSON 数据时出错:', error)
        }
      }
      reader.onerror = (error) => {
        console.error('读取文件时出错:', error)
      }
      reader.readAsText(file)
    },

    makeHeatMap(heatData) {
      const vectorSource = new VectorSource({
        features: new GeoJSONFormat().readFeatures(heatData, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        })
      })
      const heatMap = new Heatmap({
        source: vectorSource,
        // 热力图聚焦，数值越小越聚焦，越大越散
        blur: 10,
        // 热力图半径，数值越大，点越融合
        radius: 10
      })
      window.map.addLayer(heatMap)
    },

    getFeaCenter(fea) {
      const extent = fea.getGeometry().getExtent()
      return [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
    },
    makeStatMap(statData) {
      const layer = new VectorLayer({ source: new VectorSource() })
      // 解析geojson数据创建feature集合
      const featureList = new GeoJSONFormat().readFeatures(statData, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326' // 将featureProjection改为'EPSG:3857'，根据需要调整投影坐标系
      })
      // 给所有feature设置样式
      featureList.forEach((feature) =>
        feature.setStyle(new Style({ fill: new Fill({ color: 'rgba(255,153,153,0.6)' }) }))
      )
      // 将feature添加到layer上
      layer.getSource().addFeatures(featureList)
      const map = window.map
      map.addLayer(layer)
      // 遍历feature创建overlay
      featureList.forEach((feature) => {
        // 创建一个 div 元素作为容器
        const container = document.createElement('chart')
        // 实例化echart图表组件，并将其挂载到容器上
        const app = createApp(ComEchart, { feature })
        app.mount(container)
        // 创建 Overlay
        const overlay = new Overlay({
          element: container,
          offset: [-40, -50]
        })
        map.addOverlay(overlay)
        // 将 overlay 设置在面要素的中心位置
        overlay.setPosition(this.getFeaCenter(feature))
      })
      // 调整地图视图
      const extent = layer.getSource().getExtent()
      map.getView().fit(extent, { padding: [50, 50, 50, 50] }) // 根据需要调整padding值
      map.getView().setCenter([114.61296, 30.46099]) // 设置地图中心点坐标
      map.getView().setZoom(16) // 设置缩放级别
    },
    clearLayers() {
      let t = 0
      if (window.map == null) t = 100
      setTimeout(() => {
        const layers = window.map.getLayers()
        while (layers.getLength() > 1) {
          layers.pop()
        }
        const overlay = window.map.getOverlayById('chart') // 使用 Overlay 的唯一标识符（overlayId）获取对应的 Overlay 实例
        if (overlay) {
          window.map.removeOverlay(overlay) // 从地图中移除 Overlay
        }
      }, t)
    }
  }
}
</script>
<template>
  <div id="mapDom" class="map"></div>
  <input v-show="false" ref="fileRef" type="file" @change="handleFileUpload" />
  <div class="control">
    <el-button @click="goBack()">返回</el-button>
    <el-button @click="upLoadJSON(0)">热力分析</el-button>
    <el-button @click="upLoadJSON(1)">统计图表</el-button>
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
  left: 50px;
  top: 10px;
}
</style>
