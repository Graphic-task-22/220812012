//导入three.js
import * as THREE from "three";
//导入轨道控制器
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
//导入lil.gui
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

//创建场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

//创建相机
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);
camera.lookAt(0, 0, 0);

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

//创建平面
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x90ee90, 
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0;
scene.add(plane);


// 世界坐标辅助器
scene.add(new THREE.AxesHelper(5));

//创建房子模型 
// 墙体（立方体）
const wallGeometry = new THREE.BoxGeometry(4, 2.5, 4);
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
const walls = new THREE.Mesh(wallGeometry, wallMaterial);
walls.position.y = 1.25;
scene.add(walls);

// 屋顶（三角锥）
const roofGeometry = new THREE.ConeGeometry(3.5, 2, 4); // 圆锥形，4边接近金字塔形
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xcc3333 });
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.y = 3;
roof.rotation.y = Math.PI / 4;
scene.add(roof);

// 门（小立方体）
const doorGeometry = new THREE.BoxGeometry(1, 1.8, 0.1);
const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x663300 });
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, 0.9, 2.05); // 前面偏中间
scene.add(door);

// 窗户（两个小方块）
const windowGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.1);
const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });

const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
window1.position.set(-1.2, 1.6, 2.05);

const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
window2.position.set(1.2, 1.6, 2.05);

scene.add(window1, window2);

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// 渲染循环
function animate() {
  controls.update();
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

// GUI 控制面板（可选）
const gui = new GUI();
gui.addColor(wallMaterial, "color").name("墙体颜色");
gui.addColor(roofMaterial, "color").name("屋顶颜色");
gui.addColor(doorMaterial, "color").name("门颜色");
