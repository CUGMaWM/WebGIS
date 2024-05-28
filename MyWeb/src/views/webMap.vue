<script setup>
//基础地图功能
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import TileLayer from 'ol/layer/Tile.js'
import XYZ from 'ol/source/XYZ.js'
import MousePosition from 'ol/control/MousePosition.js'
import OverviewMap from 'ol/control/OverviewMap.js'
import Zoom from 'ol/control/Zoom.js'
import ZoomSlider from 'ol/control/ZoomSlider.js'
import ZoomToExtent from 'ol/control/ZoomToExtent.js'
import ScaleLine from 'ol/control/ScaleLine.js'
//绘制用
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import MultiPoint from 'ol/geom/MultiPoint'
import LineString from 'ol/geom/LineString'
import MultiLineString from 'ol/geom/MultiLineString'
import Polygon from 'ol/geom/Polygon'
import MultiPolygon from 'ol/geom/MultiPolygon'
import { Fill, Stroke, Circle, Style } from 'ol/style'
//地图选择
import OSM from 'ol/source/OSM.js'
import BingMaps from 'ol/source/BingMaps.js'
import TileImage from 'ol/source/TileImage.js'
import TileGrid from 'ol/tilegrid/TileGrid.js'
import TileWMS from 'ol/source/TileWMS.js'
import WMTS from 'ol/source/WMTS.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js'
import GeoJSON from 'ol/format/GeoJSON.js'
import { get as getProj } from 'ol/proj'
import { getWidth } from 'ol/extent'
//其他参数
import { ref } from 'vue'
import { onMounted } from 'vue'

// 1-定义外部参数
const props = defineProps({
  viewConf: { type: Object, default: () => ({}) },
  defLyrs: { type: Array, default: () => ['vec_c', 'img_c'] }
})

// 2-定义地图创建完毕的事件
const emit = defineEmits(['created'])

// 3-组件挂载后创建地图
onMounted(() => {
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

  //！！！
  //此处开始为地图添加控件
  //！！！

  // 1.创建鼠标位置控件
  const control = new MousePosition({ className: 'mousPos' })
  // 控件添加到地图
  map.addControl(control)

  //2.地图鹰眼
  const baseLayer = map.getLayers().item(1)
  // 创建鹰眼控件
  const miniMap = new OverviewMap({
    collapsed: false,
    layers: [new TileLayer({ source: baseLayer.getSource() })]
  })

  //3.地图缩放
  // 创建缩放按钮控件
  const zoom = new Zoom()
  // 创建缩放滑块控件
  const zoomSlider = new ZoomSlider()
  // 创建缩放到范围，默认使用view的投影范围
  const zoomToExtent = new ZoomToExtent()
  // 缩放控件添加到地图
  map.addControl(zoom)
  map.addControl(zoomSlider)
  map.addControl(zoomToExtent)
  // 控件添加到地图
  map.addControl(miniMap)

  // 3.5-创建完毕后触发事件
  window.map = map
  // 3.4-触发创建完毕的事件，传回地图实例对象
  emit('created', map)
})
//创建外部地图
const createOtherLayers = () => {
  // 2-创建百度地图
  const createLyrBd = () => {
    let url =
      'http://online{0-3}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20191119&scaler=1&p=1'

    // 构造分辨率序列
    const resolutions = []
    for (let i = 0; i < 19; i++) resolutions.push(Math.pow(2, 18 - i))

    // 创建切片规则对象
    const tileGrid = new TileGrid({
      origin: [0, 0],
      resolutions
    })

    return new TileLayer({
      properties: {
        name: 'baidu',
        title: '百度地图'
      },
      visible: false,
      source: new TileImage({
        projection: 'EPSG:3857',
        tileGrid: tileGrid,
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) return ''

          let tempUrl = url
          tempUrl = tempUrl.replace('{x}', tileCoord[1] < 0 ? `M${-tileCoord[1]}` : tileCoord[1])
          tempUrl = tempUrl.replace(
            '{y}',
            tileCoord[2] < 0 ? `M${tileCoord[2] + 1}` : -(tileCoord[2] + 1)
          )
          tempUrl = tempUrl.replace('{z}', tileCoord[0])

          // 范围替换
          var match = /\{(\d+)-(\d+)\}/.exec(tempUrl)
          if (match) {
            var delta = parseInt(match[2]) - parseInt(match[1])
            var num = Math.round(Math.random() * delta + parseInt(match[1]))
            tempUrl = tempUrl.replace(match[0], num.toString())
          }
          return tempUrl
        }
      })
    })
  }

  // 3-创建高德地图
  const createLyrGd = () => {
    return new TileLayer({
      properties: {
        name: 'gaode',
        title: '高德地图'
      },
      visible: false,
      source: new XYZ({
        url: 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=1&style=8&lstyle=7&x={x}&y={y}&z={z}'
      })
    })
  }

  // 4-创建OpenStreetMap地图
  const createLyrOSM = () => {
    return new TileLayer({
      properties: {
        name: 'osm',
        title: 'OpenStreetMap地图'
      },
      visible: false,
      source: new OSM()
    })
  }

  // 5-创建Bing地图
  const createLyrBing = () => {
    // 你的key, 如AvehefmVM_surC2UyDjyO2T_EvSgRUA9Te3_9D_xxxxxxx
    const key = 'AvehefmVM_surC2UyDjyO2T_EvSgRUA9Te3_9D_sj88ZYEBNNWxaufCSPGzecf-B'
    return new TileLayer({
      properties: {
        name: 'bing',
        title: 'Bing地图'
      },
      visible: false,
      source: new BingMaps({
        key: key,
        imagerySet: 'RoadOnDemand'
      })
    })
  }

  // 6-创建Arcgis地图
  const createLyrArc = () => {
    return new TileLayer({
      properties: {
        name: 'arc',
        title: 'Arcgis地图'
      },
      visible: false,
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        projection: 'EPSG:3857'
      })
    })
  }
  // 7-创建图层，接入WMS服务
  const createLyrWMS = () => {
    // 提示跨越时使用代理使用服务代理地址
    const url = '/local/geoserver/nurc/wms'
    // const url = 'http://localhost:8080/geoserver/nurc/wms'
    return new TileLayer({
      properties: {
        name: 'wms',
        title: 'WMS服务',
        locate: [114.31667, 30.51667, 4]
      },
      visible: false,
      source: new TileWMS({
        url: url,
        params: { LAYERS: 'nurc:Img_Sample' },
        projection: 'EPSG:4326',
        ratio: 1,
        serverType: 'geoserver'
      })
    })
  }

  // 8-创建图层，接入WMTS服务
  const createLyrWMTS = () => {
    // 1-构造分辨率序列
    const size = getWidth(getProj('EPSG:4326').getExtent()) / 256
    const resolutions = []
    const matrixIds = []
    for (let i = 0; i < 19; i++) {
      resolutions.push(size / Math.pow(2, i))
      matrixIds.push(i)
    }

    // 9-创建切片规则对象
    const tileGrid = new WMTSTileGrid({
      origin: [-180, 90],
      resolutions: resolutions,
      matrixIds: matrixIds
    })

    // 10-创建瓦片图层和wmts数据源
    return new TileLayer({
      properties: {
        name: 'wmts',
        title: 'WMTS服务'
      },
      visible: false,
      source: new WMTS({
        url: `http://t{0-7}.tianditu.gov.cn/vec_c/wmts?tk=b387b606afd9c346236f767123461927`,
        projection: 'EPSG:4326',
        tileGrid: tileGrid,
        crossOrigin: '*',
        format: 'image/png',
        layer: 'vec',
        matrixSet: 'c',
        style: 'default'
      })
    })
  }

  // 11-创建图层，接入WMS服务
  const createLyrWFS = () => {
    const url = '/local/geoserver/sf/ows'
    return new VectorLayer({
      properties: {
        name: 'wfs',
        title: 'WFS服务',
        locate: [114.31667, 30.51667, 7]
      },
      visible: false,
      source: new VectorSource({
        format: new GeoJSON(),
        url: (extent) => {
          return (
            url +
            '?service=WFS&' +
            'version=1.0.0&request=GetFeature&typename=sf:roads&' +
            'outputFormat=application/json&srsname=EPSG:4326&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:4326'
          )
        },
        strategy: bboxStrategy
      }),
      style: {
        'stroke-width': 2,
        'stroke-color': 'red',
        'fill-color': 'rgba(100,100,100,0.25)'
      }
    })
  }

  let map = window.map
  map.addLayer(createLyrBd())
  map.addLayer(createLyrGd())
  map.addLayer(createLyrOSM())
  map.addLayer(createLyrBing())
  map.addLayer(createLyrArc())
  map.addLayer(createLyrWMS())
  map.addLayer(createLyrWMTS())
  map.addLayer(createLyrWFS())
}
//此处作按钮控制
//1.必要参数
let mainMap = null
let view = null
let zoom = null
let center = null
let rotation = null

//2.阻塞进程以避免undefined
setTimeout(() => {
  mainMap = window.map
  view = mainMap.getView()
  // 记录初始状态
  zoom = view.getZoom()
  center = view.getCenter()
  rotation = view.getRotation()
  createOtherLayers()
  createLayerManage(window.map)
}, 1000)

//3.移位控制
// 移动到武汉
const onMoveWh = () => {
  view = window.map.getView()
  if (!view) return
  view.setCenter([114.31667, 30.51667])
  view.setZoom(12)
}
// 复位
const onRestore = () => {
  if (!view) return
  view.setZoom(zoom)
  view.setCenter(center)
  view.setRotation(rotation)
}

//4.响应比例尺控制条
let scale = null
const onScaleChange = (type) => {
  if (!window.map) return
  let olmap = window.map
  // 移除旧比例尺
  scale && olmap.removeControl(scale)
  // 创建新比例尺
  scale = new ScaleLine({ bar: type === 'bar' })
  // 添加到地图
  olmap.addControl(scale)
}

//5.图层切换
const checks = ref([])
let olmap = null
let layers = []
const createLayerManage = (map) => {
  olmap = map
  // 初始化 checks 数组为空
  checks.value = []
  // 获取地图图层信息并处理
  layers = map
    .getLayers()
    .getArray()
    .map((layer) => {
      checks.value.push(layer.get('name'))
      return {
        name: layer.get('name'),
        title: layer.get('title'),
        layer
      }
    })
}
// 图层开关控制
const onCheckChange = () => {
  if (!window.map) return
  layers.forEach((layer) => {
    layer.layer.setVisible(checks.value.includes(layer.name))
  })
}
</script>

<script>
//地图跳转
export default {
  methods: {
    //页面跳转部分
    goLine() {
      this.$router.push({ path: '/calLine' })
    },
    upLoadJSON() {
      this.$refs.fileRef.dispatchEvent(new MouseEvent('click')) //弹出选择本地文件
    },
    //读取JSON并绘制部分
    handleFileUpload(event) {
      // 处理文件上传逻辑
      this.clearLayers()

      const file = event.target.files[0]
      this.ReadAndWrite(file)
    },
    ReadAndWrite(file) {
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
          this.parseJSON(jsonData)
        } catch (error) {
          console.error('解析 JSON 数据时出错:', error)
        }
      }
      reader.onerror = (error) => {
        console.error('读取文件时出错:', error)
      }
      reader.readAsText(file)
    },
    parseJSON(jsonData) {
      const parsedData = jsonData
      let mainMap = null
      // 检查数据类型是否为 FeatureCollection,并读取数据
      setTimeout(() => {
        mainMap = window.map
        if (parsedData.type == 'FeatureCollection') {
          const features = parsedData.features
          // 遍历每个 Feature
          features.forEach((feature) => {
            if (feature.type == 'Feature') {
              const geometry = feature.geometry
              if (geometry.type == 'GeometryCollection') {
                geometry.geometries.forEach((geometry) => {
                  const coordinates = geometry.coordinates
                  // 提取几何类型和坐标信息
                  const geometryType = geometry.type
                  this.drawFeatures(geometryType, coordinates, mainMap)
                })
              } else {
                const coordinates = geometry.coordinates
                // 提取几何类型和坐标信息
                const geometryType = geometry.type
                this.drawFeatures(geometryType, coordinates, mainMap)
              }
            }
          })
        }
      }, 1000)
    },
    drawFeatures(geometryType, coordinates, mainMap) {
      //点格式
      const PointStyle = new Style({
        image: new Circle({
          radius: 10, // 半径
          fill: new Fill({ color: 'red' }), // 填充色
          stroke: new Stroke({ color: 'yellow' }) // 边框
        })
      })
      //线格式
      const LineStyle = new Style({
        stroke: new Stroke({ color: 'blue', width: 10 })
      })
      //面格式
      const PolygonStyle = new Style({
        fill: new Fill({ color: 'blue' })
      })
      switch (geometryType) {
        case 'Point':
          {
            const thisPointFeature = new Feature(new Point(coordinates))
            const PointLayer = new VectorLayer({
              source: new VectorSource({
                features: [thisPointFeature]
              }),
              style: PointStyle
            })
            mainMap.addLayer(PointLayer)
          }
          break

        case 'MultiPoint':
          coordinates.forEach((coordinate) => {
            const MultiPointCoordinates = [coordinate]
            const thisMultiPointFeature = new Feature(new MultiPoint(MultiPointCoordinates))
            const MultiPointLayer = new VectorLayer({
              source: new VectorSource({
                features: [thisMultiPointFeature]
              }),
              style: PointStyle
            })
            mainMap.addLayer(MultiPointLayer)
          })
          break

        case 'LineString':
          coordinates.forEach((coordinate) => {
            const LineCoordinates = [coordinate]
            const thisLineString = new Feature(new LineString(LineCoordinates))
            const LineStringLayer = new VectorLayer({
              source: new VectorSource({
                features: [thisLineString]
              }),
              style: LineStyle
            })
            mainMap.addLayer(LineStringLayer)
          })
          break

        case 'MultiLineString':
          coordinates.forEach((coordinate) => {
            const MLCoordinates = [coordinate]
            const thisMultiLineString = new Feature(new MultiLineString(MLCoordinates))
            const MultiLineStringLayer = new VectorLayer({
              source: new VectorSource({
                features: [thisMultiLineString]
              }),
              style: LineStyle
            })
            mainMap.addLayer(MultiLineStringLayer)
          })
          break

        case 'Polygon':
          coordinates.forEach((coordinate) => {
            const polygonCoordinates = [coordinate] // 将单个坐标包装在二维数组中
            const thisPolygon = new Feature(new Polygon(polygonCoordinates))
            const PolygonLayer = new VectorLayer({
              source: new VectorSource({
                features: [thisPolygon]
              }),
              style: PolygonStyle
            })
            mainMap.addLayer(PolygonLayer)
          })
          break

        case 'MultiPolygon':
          coordinates.forEach((coordinate) => {
            const MPCoordinates = [coordinate]
            const thisMultiPolygon = new Feature(new MultiPolygon(MPCoordinates))
            const MultiPolygonLayer = new VectorLayer({
              source: new VectorSource({
                features: [thisMultiPolygon]
              }),
              style: PolygonStyle
            })
            mainMap.addLayer(MultiPolygonLayer)
          })
          break

        default:
          break
      }
    },
    goNav() {
      var newWindow = window.open('/config/navigate.html')
      newWindow.onload = function () {
        window.close()
      }
    },
    goAna() {
      this.$router.push({ path: '/heatMap' })
    },
    goMark() {
      this.$router.push({ path: '/mapMark' })
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
    }
  }
}
</script>

<template>
  <div id="mapDom" class="map"></div>

  <input v-show="false" ref="fileRef" type="file" @change="handleFileUpload" />
  <div class="control">
    <el-button @click="onMoveWh('bar')">移动到武汉</el-button>
    <el-button @click="onRestore('bar')">复位</el-button>
    <el-button @click="onScaleChange('line')">比例尺线</el-button>
    <el-button @click="onScaleChange('bar')">比例尺条</el-button>
    <el-button @click="upLoadJSON()">上传JSON</el-button>
    <el-button @click="goLine()">量测功能</el-button>
    <el-button @click="goNav()">导航模块</el-button>
    <el-button @click="goAna()">空间分析</el-button>
    <el-button @click="goMark()">地图标注</el-button>
  </div>
  <el-card class="layerControl">
    <el-checkbox-group v-model="checks" @change="onCheckChange">
      <el-checkbox
        v-for="layer in layers"
        :key="layer.name"
        :label="layer.name"
        :checked="index != 0"
      >
        {{ layer.title }}
      </el-checkbox>
    </el-checkbox-group>
  </el-card>
</template>

<style>
.map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.mousPos {
  position: absolute;
  bottom: 5px;
  right: 8px;
  color: rgb(0, 0, 0);
}

.control {
  position: absolute;
  left: 80px;
  top: 10px;
}

.layerControl {
  position: absolute;
  right: 5px;
  top: 10px;
  width: 480px;
}
</style>
