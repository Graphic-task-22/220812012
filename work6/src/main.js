//导入three.js
import * as THREE from "three";
//导入轨道控制器
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

//导入山脉
import mountain, { updatePosition } from './mountain';

//创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

scene.add(mountain);

//创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(258, 169, -280);
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

// 渲染循环
function animate() {
  controls.update();
  updatePosition();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// 窗口适配
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
