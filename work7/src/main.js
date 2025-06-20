//导入three.js
import * as THREE from "three";
//导入轨道控制器
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

//创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

//创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10 ,15);
camera.lookAt(0, 0, 0);

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 世界坐标辅助器
scene.add(new THREE.AxesHelper(5));

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 100, 7);
scene.add(dirLight);

//3D模型加载
const loader = new GLTFLoader();
let mixer; // 用于动画控制

loader.load('./public/RobotExpressive.gltf', function(gltf) {
  const model = gltf.scene;
  scene.add(model);

  //创建包围盒
  const box = new THREE.Box3().setFromObject(model);
  const boxHelper = new THREE.BoxHelper(model, 0xff0000);
  scene.add(boxHelper);
  const boundingBoxes = [];
  boundingBoxes.push(box);

  // 检查是否有动画数据
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();  // 播放动画
    });
  }
}, undefined, function(error) {
  console.error(error);
});

const clock = new THREE.Clock();


// 渲染循环
function animate() {
  controls.update();
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 窗口适配
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
