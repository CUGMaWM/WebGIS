export default {
  data: [
    {
      title: '多元数据',
      name: 'dataService',
      children: [
        {
          title: '公开地图',
          name: 'PublicMap',
          url: '../views/dataService/PublicMap.vue',
          params: null
        },
        { title: 'OGC地图', name: 'OGCMap', url: '../views/dataService/OGCMap.vue', params: null },
        {
          title: '开放地图',
          name: 'OpenMap',
          url: '../views/dataService/OpenMap.vue',
          params: null
        }
      ]
    },
    {
      title: '图形绘制',
      name: 'GraDraw',
      children: [
        { title: '绘制点', name: 'DrawPoint', url: '../views/graDraw/DrawPoint.vue', params: null },
        { title: '绘制线', name: 'DrawLine', url: '../views/graDraw/DrawLine.vue', params: null },
        {
          title: '绘制面',
          name: 'DrawPolygon',
          url: '../views/graDraw/DrawPolygon.vue',
          params: null
        },
        {
          title: '绘制贝赛尔曲线',
          name: 'DrawBezier',
          url: '../views/graDraw/DrawBezier.vue',
          params: null
        },
        {
          title: '图形样式定制',
          name: 'CustomStyle',
          url: '../views/graDraw/CustomStyle.vue',
          params: null
        }
      ]
    },
    {
      title: '图形编辑',
      name: 'GraEdit',
      children: [
        {
          title: '图形选中',
          name: 'GraSelect',
          url: '../views/graEdit/GraSelect.vue',
          params: null
        },
        { title: '图形平移', name: 'GraMove', url: '../views/graEdit/GraMove.vue', params: null },
        {
          title: '图形旋转',
          name: 'GraRotate',
          url: '../views/graEdit/GraRotate.vue',
          params: null
        }
      ]
    }
  ]
}
