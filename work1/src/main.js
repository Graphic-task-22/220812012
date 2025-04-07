//导入three.js
import * as THREE from "three";
//导入轨道控制器
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

//创建场景
const scene = new THREE.Scene();

//创建相机
const camera = new THREE.PerspectiveCamera(
  45, //视角
  window.innerWidth / window.innerHeight,  //相机宽高比
  0.1, //近平面
  1000  //远平面
);
//设置相机位置
camera.position.z = 100;//正对眼睛是z轴 垂直是y轴
camera.position.y = 100;
camera.position.x = 80;
camera.lookAt(0, 0, 0);//默认看向原点

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建球体
var sphereGeometry=new THREE.SphereGeometry(30,30,30);
const texLoader = new THREE.TextureLoader();
const texture=texLoader.load("./src/earth_day_4096.jpg");
const textureCube = new THREE.CubeTextureLoader()
  .setPath('./src/')
  .load(
    ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
    var sphereMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      envMap: textureCube,
      reflectivity: 0.3, 
      combine: THREE.MixOperation,
      color: 0xffffff,
      specular: 0xaaaaaa,
      shininess: 100
    });
scene.background = textureCube;

//创建网格
const ball = new THREE.Mesh(sphereGeometry, sphereMaterial);
ball.position.set(0, 0, 0);
//将网格添加到场景中
scene.add(ball);

// 环境光（均匀照亮场景中所有物体）
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 颜色, 强度
scene.add(ambientLight);

// 点光源（从某点向外照射）
const pointLight = new THREE.PointLight(0xffffff, 300);
pointLight.position.set(30, 10, 30);
scene.add(pointLight);

// 用小球表示点光源的位置（可视化）
const lightSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
);
lightSphere.position.copy(pointLight.position);
scene.add(lightSphere);


//添加世界坐标辅助器
const axesHelper = new THREE.AxesHelper(150); //坐标线段长度5
scene.add(axesHelper);

//添加轨道控制器(监听页面事件，实际上动的是相机)
const controls = new OrbitControls(camera, renderer.domElement);
//设置带阻尼的惯性
controls.enableDamping = true;
//设置阻尼系数
controls.dampingFactor = 0.05;

//渲染函数
function animate(){
  controls.update();
  requestAnimationFrame(animate);
  //渲染
  renderer.render(scene, camera);
}
animate();

//窗口自适应功能
//监听窗口变化
window.addEventListener("resize",() => {
  //重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight);
  //重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  //更新相机投影矩阵
  camera.updateProjectionMatrix();
});

//创建GUI
const gui = new GUI();

// 定义默认状态
const defaultState = {
  cameraPosition: {
    x: 15,
    y: 20,
    z: 20,
  },
  ballPosition: {
    x: 0,
    y: 0,
    z: 0,
  }
};

// 添加重置函数
function resetDefaults() {
  camera.position.set(
    defaultState.cameraPosition.x,
    defaultState.cameraPosition.y,
    defaultState.cameraPosition.z
  );
  camera.lookAt(0, 0, 0);
  ball.position.set(
    defaultState.ballPosition.x,
    defaultState.ballPosition.y,
    defaultState.ballPosition.z
  );
  controls.update();
}

// 添加清除场景函数
function clearScene() {
  // 遍历所有子对象并移除除辅助线以外的物体
  scene.children = scene.children.filter(obj => {
    if (obj !== axesHelper && obj.type !== 'AmbientLight' && obj.type !== 'PointLight') {
      scene.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
      return false;
    }
    return true;
  });
}

// 添加 GUI 控制按钮
const actions = {
  resetDefaults,
  clearScene
};

gui.add(actions, 'resetDefaults').name("重置默认值");

let folder1 = gui.addFolder("物体");

let folder2 = folder1.addFolder("位置");
folder2.add(ball.position, 'x').min(-10).max(10).step(0.1).name("x坐标");
folder2.add(ball.position, 'y').min(-10).max(10).step(0.1).name("y坐标");
folder2.add(ball.position, 'z').min(-10).max(10).step(0.1).name("z坐标");

let folder3 = folder1.addFolder("材质");
let materialParams = {
  color: "#" + ball.material.color.getHexString(),
  transparent: ball.material.transparent,
  opacity: ball.material.opacity,
  specular: "#" + ball.material.specular.getHexString()
};
folder3.addColor(materialParams,"color").name("颜色").onChange((val) => {
  ball.material.color.set(val);
});
folder3.add(materialParams, "transparent").name("是否透明").onChange((val) => {
  ball.material.transparent = val;
  ball.material.needsUpdate = true;
});
folder3.add(materialParams, "opacity", 0, 1).step(0.01).name("透明度").onChange((val) => {
  ball.material.opacity = val;
});
folder3.addColor(materialParams, "specular").name("高光").onChange((val) => {
  ball.material.specular.set(val);
});

let folder4 = gui.addFolder("光源");
let folder5 = folder4.addFolder("环境光");
let ambientParams = {
  color: "#ffffff",
  intensity: 0.5
};
folder5.addColor(ambientParams, "color").name("颜色").onChange((val) => {
  ambientLight.color.set(val);
});
folder5.add(ambientParams, "intensity", 0, 2).step(0.1).name("强度").onChange((val) => {
  ambientLight.intensity = val;
});

let folder6 = folder4.addFolder("点光源");
let pointParams = {
  color: "#ffffff",
  intensity: 1.6
};
folder6.addColor(pointParams, "color").name("颜色").onChange((val) => {
  pointLight.color.set(val);
});
folder6.add(pointParams, "intensity", 0, 2).step(0.1).name("强度").onChange((val) => {
  pointLight.intensity = val;
});

let folder7 = folder6.addFolder("位置");
folder7.add(pointLight.position, "x", -100, 100).step(0.1).name("x 坐标");
folder7.add(pointLight.position, "y", -100, 100).step(0.1).name("y 坐标");
folder7.add(pointLight.position, "z", -100, 100).step(0.1).name("z 坐标");

gui.add(actions, 'clearScene').name("清除场景");