<script setup>
import { defineProps, onMounted } from 'vue'
import Heatmap from 'ol/layer/Heatmap'
import VectorSource from 'ol/source/Vector'
import GeoJSONFormat from 'ol/format/GeoJSON'
import TileLayer from 'ol/layer/Tile.js'
import XYZ from 'ol/source/XYZ.js'
import Map from 'ol/Map'
import View from 'ol/View'

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
      key: 'img_c',
      title: '天地图影像',
      option: {
        projection: 'EPSG:4326',
        url: `http://t{0-7}.tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=b387b606afd9c346236f767123461927`
      }
    },
    {
      key: 'vec_c',
      title: '天地图',
      option: {
        projection: 'EPSG:4326',
        url: `http://t{0-7}.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=b387b606afd9c346236f767123461927`
      }
    },
    {
      key: 'cva_c',
      title: '天地图注记',
      option: {
        projection: 'EPSG:4326',
        url: `http://t{0-7}.tianditu.gov.cn/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=b387b606afd9c346236f767123461927`
      }
    },
    {
      key: 'gaode',
      title: '瓦片底图',
      option: {
        projection: 'EPSG:3857',
        url: 'http://mapcdn.lshida.com/maps/vt?lyrs=m@292000000&hl=zh-CN&gl=cn&src=app&x={x}&y={y}&z={z}&s='
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
    goBack() {
      this.$router.push({ path: '/' })
    },
    upLoadJSON() {
      this.$refs.fileRef.dispatchEvent(new MouseEvent('click')) //弹出选择本地文件
    },
    //读取JSON并绘制部分
    handleFileUpload(event) {
      // 处理文件上传逻辑
      const file = event.target.files[0]
      const extension = file.name.split('.').pop().toLowerCase()
      if (extension !== 'json') return
      const reader = new FileReader()
      reader.onload = (event) => {
        const fileData = event.target.result
        try {
          const jsonData = JSON.parse(fileData)
          console.log(jsonData)
          this.makeHeatMap(jsonData)
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
    }
  }
}
</script>
<template>
  <div id="mapDom" class="map"></div>
  <input v-show="false" ref="fileRef" type="file" @change="handleFileUpload" />
  <div class="control">
    <el-button @click="goBack()">返回</el-button>
    <el-button @click="upLoadJSON()">热力分析</el-button>
  </div>
</template>

<style>
.control {
  position: absolute;
  left: 50px;
  top: 10px;
}
</style>
