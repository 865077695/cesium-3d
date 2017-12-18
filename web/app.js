/**
 * 地图基本配置
 */
var viewer = new Cesium.Viewer('cesiumContainer', {
  animation: false,//是否创建动画小器件，左下角仪表    
  baseLayerPicker: false,//是否显示图层选择器    
  // fullscreenButton: false,//是否显示全屏按钮    
  geocoder: false,//是否显示geocoder小器件，右上角查询按钮    
  homeButton: true,//是否显示Home按钮    
  infoBox: true,//是否显示信息框    
  sceneModePicker: false,//是否显示3D/2D选择器    
  selectionIndicator: true,//是否显示选取指示器组件    
  timeline: false,//是否显示时间轴    
  navigationHelpButton: true,//是否显示右上角的帮助按钮    
  scene3DOnly: true,//如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源    
  clock: new Cesium.Clock(),//用于控制当前时间的时钟对象   
  imageryProvider: new Cesium.WebMapTileServiceImageryProvider({  // 使用天地图
    url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
    layer: "tdtBasicLayer",
    style: "default",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible",
    show: false,
    maximumLevel: 18
  }),
  selectedImageryProviderViewModel: undefined,//当前图像图层的显示模型，仅baseLayerPicker设为true有意义    
  imageryProviderViewModels: Cesium.createDefaultImageryProviderViewModels(),//可供BaseLayerPicker选择的图像图层ProviderViewModel数组    
  selectedTerrainProviderViewModel: undefined,//当前地形图层的显示模型，仅baseLayerPicker设为true有意义    
  terrainProviderViewModels: Cesium.createDefaultTerrainProviderViewModels(),//可供BaseLayerPicker选择的地形图层ProviderViewModel数组       
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),//地形图层提供者，仅baseLayerPicker设为false有意义    
  fullscreenElement: document.body,//全屏时渲染的HTML元素,    
  useDefaultRenderLoop: true,//如果需要控制渲染循环，则设为true    
  targetFrameRate: undefined,//使用默认render loop时的帧率    
  showRenderLoopErrors: false,//如果设为true，将在一个HTML面板中显示错误信息    
  automaticallyTrackDataSourceClocks: true,//自动追踪最近添加的数据源的时钟设置    
  contextOptions: undefined,//传递给Scene对象的上下文参数（scene.options）    
  sceneMode: Cesium.SceneMode.SCENE3D,//初始场景模式    
  mapProjection: new Cesium.WebMercatorProjection(),//地图投影体系    
  dataSources: new Cesium.DataSourceCollection()
  //需要进行可视化的数据源的集合    
});
viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({  // 全球矢量中文注记
  url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
  layer: "tdtAnnoLayer",
  style: "default",
  format: "image/jpeg",
  tileMatrixSetID: "GoogleMapsCompatible"
}));
/**
 * 设置初始视角
 */
viewer.scene.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(119.364204, 32.31024112, 30),
  orientation: {
    heading: Cesium.Math.toRadians(-20.0), // 方向
    pitch: Cesium.Math.toRadians(-10.0),// 倾斜角度
    roll: 0
  },
});


/**
 * 工厂信息
 */
var factoryPositon = [
  { name: 'A工厂', value: 'a', 'position': [116.3920129972, 39.9060998859, 100] },
  { name: '精湛光电', value: 'jingzhan', 'position': [119.363404, 32.31034112, 40] },
  { name: 'C工厂', value: 'c', 'position': [116.3618129972, 39.9072998859, 200] },
]

/**
 * 设置相机位置
 * @param 工厂id
 * 传入工厂id，将相机跳转至该工厂
 */
function setCameraPosition(factory) {
  //首先根据value找到是哪个工厂
  var factory = factoryPositon.filter(function (item) {
    return item.value === factory
  })

  position = factory[0].position  // 获取该工厂的位置信息
  console.log(position)
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]), // 设置位置
    orientation: {
      heading: Cesium.Math.toRadians(20.0), // 方向
      pitch: Cesium.Math.toRadians(-28.0),// 倾斜角度
      roll: 0
    },
    duration: 1, // 飞行时间
    complete: function () {
      // 到达位置后执行的回调函数
      console.log('到达目的地');
    },
    cancle: function () {
      // 如果取消飞行则会调用此函数
      console.log('飞行取消')
    },
    pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
    maximumHeight: 10000000, // 相机最大飞行高度
    // flyOverLongitude: 100, // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度
  });
}
// 切换工厂
document.getElementById('factory').onchange = function (tar) {
  var factory = tar.target.value
  console.log(factory)
  setCameraPosition(factory)
}
// setTimeout(function () { setCameraPosition('jingzhan') }, 1000)  // 初始化位置为精湛光电公司
/**
 * 建筑生成器
 */
function buildFactory(obj) {
  return viewer.entities.add({
    id: obj.id,
    name: obj.name,
    position: Cesium.Cartesian3.fromDegrees(obj.position[0], obj.position[1]),
    model: {
      uri: obj.uri
    },
    data: obj.data
  })
}

// 生成A工厂建筑
var ABuild1 = buildFactory({
  id: 'ABuild1',
  name: 'ABuild1',
  position: [116.3938129972, 39.9072998859],
  uri: '../model/factory2.gltf',
  data: { "temp": "50℃", "shidu": "4" }
})
var ABuild2 = buildFactory({
  id: 'ABuild2',
  name: 'ABuild2',
  position: [116.3928129972, 39.9072998859],
  uri: '../model/factory3.gltf',
  data: { "pm25": "60", "shidu": "4" }
})
var ABuild3 = buildFactory({
  id: 'ABuild3',
  name: 'ABuild3',
  position: [116.3918129972, 39.9072998859],
  uri: '../model/factory.gltf',
  data: { "wendu": "50℃", "press": "4pa" }
})
// 生成B工厂建筑
var BBuild1 = buildFactory({  // 监控室
  id: 'BBuild1',
  name: '监控室',
  position: [119.362904, 32.31120112],
  uri: '../model/01.jiankong.gltf',
  data: { "摄像头数量": "10", "报警信息": "无" }
})
var BBuild2 = buildFactory({  // 围栏
  id: 'BBuild2',
  name: '围栏',
  position: [119.362904, 32.31120112],
  uri: '../model/01.weilan.gltf',
  data: { "围栏状态": "完好", "上次检修": "2017-11-20" }
})
var BBuild3 = buildFactory({  // 办公楼
  id: 'BBuild3',
  name: '办公楼',
  position: [119.362904, 32.31120112],
  uri: '../model/01.bangonglou.gltf',
  data: { "进入人数": "100", "外出人数": "20" }
})
var BBuild4 = buildFactory({  // 信号塔
  id: 'BBuild4',
  name: '信号塔',
  position: [119.362904, 32.31120112],
  uri: '../model/01.xinhaota.gltf',
  data: { "上月创收": "60", "运行状态": "运行中" }
})
var BBuild5 = buildFactory({  // 厂房
  id: 'BBuild5',
  name: '厂房',
  position: [119.362904, 32.31120112],
  uri: '../model/01.changfang.gltf',
  data: { "粉尘": "2.5", "湿度": "70%" }
})
var BBuild6 = buildFactory({  // 食堂
  id: 'BBuild6',
  name: '食堂',
  position: [119.362904, 32.31120112],
  uri: '../model/01.shitang.gltf',
  data: { "就餐人数": "300", "湿度": "75%" }
})


/**
 * 悬停处理
 */
var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
handler.setInputAction(
  function (movement) {
    var pick = viewer.scene.pick(movement.endPosition);
    if (Cesium.defined(pick) && Cesium.defined(pick.node) && Cesium.defined(pick.mesh)) {
      // console.log('node: ' + pick.node.name + '. mesh: ' + pick.mesh.name);
    }
  },
  Cesium.ScreenSpaceEventType.MOUSE_MOVE
);



// 点击处理
var selectedEntity = new Cesium.Entity();
var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
  // Pick a new feature 如果点击的不是模型则返回
  var pickedFeature = viewer.scene.pick(movement.position);
  if (!Cesium.defined(pickedFeature)) {
    clickHandler(movement);
    return;
  }
  // 以下为点击模型时才执行的代码
  console.log('click')

  selectedEntity.name = pickedFeature.id.name; // 标题
  console.log(pickedFeature.id._data)
  var data = pickedFeature.id._data
  selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
  viewer.selectedEntity = selectedEntity;
  var tbodyContent = ''
  for (var i in data) {
    tbodyContent += '<tr><th>' + i + '</th><td>' + data[i] + '</td></tr>'
  }
  selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>' +
    tbodyContent
  '</tbody></table>';
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);