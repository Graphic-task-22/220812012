//导入轨道控制器
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import groups from "./bar";


//创建场景
const scene = new THREE.Scene();

scene.add(groups);

//创建相机
const camera = new THREE.PerspectiveCamera(
  45, //视角
  window.innerWidth / window.innerHeight,  //相机宽高比
  1, //近平面
  1000  //远平面
);
//设置相机位置
camera.position.set(50, 50, 200)
camera.lookAt(50, 50, 0);

//创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 环境光（均匀照亮场景中所有物体）
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // 颜色, 强度
scene.add(ambientLight);

// 点光源（从某点向外照射）
const pointLight = new THREE.PointLight(0xffffff, 300);
pointLight.position.set(30, 10, 30);
scene.add(pointLight);

// //添加轨道控制器(监听页面事件，实际上动的是相机)
// const controls = new OrbitControls(camera, renderer.domElement);
// //设置带阻尼的惯性
// controls.enableDamping = true;
// //设置阻尼系数
// controls.dampingFactor = 0.05;

// controls.target.set(-50, 80, -700); // 设置 OrbitControls 的观察中心点
// controls.update();            // 更新控制器状态

//渲染函数
function animate(){
  // controls.update();
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