//导入three.js
import * as THREE from "three";
//导入轨道控制器
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from 'three/addons/libs/stats.module.js'; 

let renderer, camera, scene, ambientLight, pointLight;
let isAnimating = true; // 控制动画开关

const geometry = new THREE.BoxGeometry(50, 50, 50);
const material = new THREE.MeshBasicMaterial({ color:0xff00, opacity: 0.8, transparent: true });
const cube = new THREE.Mesh(geometry, material);

pointLight = new THREE.PointLight(0xffffff, 1.0);
pointLight.intensity = 1.0;//光照强度
pointLight.decay = 0.0;//设置光源不随距离衰减
pointLight.position.set(100, 100, 100);//点光源放在x轴上

const textures = [
  new THREE.TextureLoader().load("./src/snowflake1.png"),
  new THREE.TextureLoader().load("./src/snowflake2.png"),
  new THREE.TextureLoader().load("./src/snowflake3.png"),
  new THREE.TextureLoader().load("./src/snowflake4.png"),
  new THREE.TextureLoader().load("./src/snowflake5.png"),
];

//精灵族
const group = new THREE.Group();
for (let i = 0; i < 16000; i++) {
  // 随机选一个纹理
  const texture = textures[Math.floor(Math.random() * textures.length)];
  // 使用选中的纹理创建材质
  const spriteMaterial = new THREE.SpriteMaterial({
      color: 0x00ffff,
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  group.add(sprite);
    sprite.scale.set(1, 1, 1);
    // 设置精灵模型位置，在长方体空间上上随机分布
    const x = 800 * (Math.random() - 0.5);
    const y = 600 * Math.random();
    const z = 800 * (Math.random() - 0.5);
    sprite.position.set(x, y, z)
}

const clock = new THREE.Clock();
function loop() {
    // loop()两次执行时间间隔
    const t = clock.getDelta();
    group.children.forEach(sprite => {
        // 雨滴的y坐标每次减t*60
        sprite.position.y -= t*60;
        if (sprite.position.y < 0) {
            sprite.position.y = 600;
        }
    });
    requestAnimationFrame(loop);
}

function init() {
  scene = new THREE.Scene();
  scene.add(group);
  scene.add(pointLight);

  // 添加环境光
  ambientLight = new THREE.AmbientLight(0x404040, 1); // 默认颜色和强度
  console.log(ambientLight.color instanceof THREE.Color); // true
  scene.add(ambientLight);

  //添加相机
  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    50,
    3000
  );
  camera.position.set(350, 350, 350);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  initHelper();
  animate(); // 确保动画从一开始就运行
}

// 创建 stats 统计帧率
const stats = new Stats(); // 使用导入的 Stats 类
document.body.appendChild(stats.domElement);

function initHelper() {
  const controls = new OrbitControls(camera, renderer.domElement);

  // 设置阻尼（惯性）效果
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  controls.update();
  controls.addEventListener('change', function () {
    renderer.render(scene, camera);
  });
}

function animate() {
  if (!isAnimating) return;
  requestAnimationFrame(animate);
  stats.update();

  // 更新雪花位置
  const t = clock.getDelta();
  group.children.forEach(sprite => {
    sprite.position.y -= t * 60;
    if (sprite.position.y < 0) {
      sprite.position.y = 600;
    }
  });

  // 渲染
  renderer.render(scene, camera);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
}

init();

//窗口自适应功能
window.addEventListener("resize",() => {
  //重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight);
  //重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight;
  //更新相机投影矩阵
  camera.updateProjectionMatrix();
});