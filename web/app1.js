// A simple demo of 3D Tiles feature picking with 悬浮和选中交互
// Building data courtesy of NYC OpenData portal: http://www1.nyc.gov/site/doitt/initiatives/3d-building.page
var viewer = new Cesium.Viewer('cesiumContainer');

// 设置初始视角
var initialPosition = Cesium.Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
viewer.scene.camera.setView({
  destination: initialPosition,
  orientation: initialOrientation,
  endTransform: Cesium.Matrix4.IDENTITY
});

// Load the NYC buildings tileset加载建筑模型
var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
  url: 'https://beta.cesium.com/api/assets/1461?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkYWJmM2MzNS02OWM5LTQ3OWItYjEyYS0xZmNlODM5ZDNkMTYiLCJpZCI6NDQsImFzc2V0cyI6WzE0NjFdLCJpYXQiOjE0OTkyNjQ3NDN9.vuR75SqPDKcggvUrG_vpx0Av02jdiAxnnB1fNf-9f7s'
}));

// HTML overlay for showing feature name on mouseover鼠标悬停时显试tooltip
var nameOverlay = document.createElement('div');
viewer.container.appendChild(nameOverlay);
nameOverlay.className = 'backdrop';
nameOverlay.style.display = 'none';
nameOverlay.style.position = 'absolute';
nameOverlay.style.bottom = '0';
nameOverlay.style.left = '0';
nameOverlay.style['pointer-events'] = 'none';
nameOverlay.style.padding = '4px';
nameOverlay.style.backgroundColor = 'black';

// Information about the currently selected feature当前选中模型的特征信息
var selected = {    // 选中
  feature: undefined,
  originalColor: new Cesium.Color()
};

// Information about the currently highlighted feature
var highlighted = { // 高亮
  feature: undefined,
  originalColor: new Cesium.Color()
};

// An entity object which will hold info about the currently selected feature for infobox display
var selectedEntity = new Cesium.Entity();
// Color a feature yellow on hover.悬停时黄色
viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {  // 悬停事件
  // If a feature was previously highlighted, undo the highlight  // 如果已经是高亮的，就不再高亮了
  if (Cesium.defined(highlighted.feature)) {
    highlighted.feature.color = highlighted.originalColor;
    highlighted.feature = undefined;
  }

  // Pick a new feature 选择一个新特性
  var pickedFeature = viewer.scene.pick(movement.endPosition);
  console.log(Cesium.defined(pickedFeature))  // 是否悬停在模型上
  if (!Cesium.defined(pickedFeature)) {
    nameOverlay.style.display = 'none'; // 如果未悬停在模型上，隐藏tooltip
    return;
  }

  // A feature was picked, so show it's overlay content 悬停时 显试tooltip并设置位置
  nameOverlay.style.display = 'block';
  nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.endPosition.y + 'px';
  nameOverlay.style.left = movement.endPosition.x + 'px';
  var name = pickedFeature.getProperty('name');
  if (!Cesium.defined(name)) {
    name = pickedFeature.getProperty('id');
  }
  nameOverlay.textContent = name;

  // Highlight the feature if it's not already selected.  如果没有已经被选中，则高亮
  if (pickedFeature !== selected.feature) {
    highlighted.feature = pickedFeature;
    Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
    pickedFeature.color = Cesium.Color.YELLOW;
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Color a feature on selection and show metadata in the InfoBox.选中设置为高亮并在信息窗口展示元数据
var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {  // 设置点击事件
  // If a feature was previously selected, undo the highlight如果已经选中了，就不再设置高亮
  if (Cesium.defined(selected.feature)) {
    selected.feature.color = selected.originalColor;
    selected.feature = undefined;
  }

  // Pick a new feature
  var pickedFeature = viewer.scene.pick(movement.position);
  if (!Cesium.defined(pickedFeature)) { // 如果点击不在模型上，返回
    clickHandler(movement);
    return;
  }
  console.log('click')  // 以下为点击在模型上的操作

  // Select the feature if it's not already selected  如果之前没有被选中，则此时选中时设置特征
  if (selected.feature === pickedFeature) {
    return;
  }
  selected.feature = pickedFeature;
  console.log(pickedFeature)
  console.log(selected.feature)
  // Save the selected feature's original color保存初始颜色
  if (pickedFeature === highlighted.feature) {
    Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
    highlighted.feature = undefined;
  } else {
    Cesium.Color.clone(pickedFeature.color, selected.originalColor);
  }

  // Highlight newly selected feature
  pickedFeature.color = Cesium.Color.LIME;

  // Set feature infobox description  设置信息窗口
  var featureName = pickedFeature.getProperty('name');
  selectedEntity.name = featureName;
  selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
  viewer.selectedEntity = selectedEntity;
  selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>' +
    '<tr><th>BIN</th><td>' + pickedFeature.getProperty('BIN') + '</td></tr>' +
    '<tr><th>DOITT ID</th><td>' + pickedFeature.getProperty('DOITT_ID') + '</td></tr>' +
    '<tr><th>SOURCE ID</th><td>' + pickedFeature.getProperty('SOURCE_ID') + '</td></tr>' +
    '</tbody></table>';
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
