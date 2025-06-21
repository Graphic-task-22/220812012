// npc.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


let npcMixer = null;
let npc = null;
let idleAction = null;
let walkAction = null;
let currentAction = null;
let runAction = null; //  奔跑动作
let npcBoundingBox = null; // NPC的包围盒
let boxHelper = null; // 包围盒可视化

const walkSpeed = 50;
const runSpeed = 80; //  奔跑速度
const keyState = {};

// 添加移动范围限制
const movementLimits = {
  minX: -250,
  maxX: 250,
  minZ: -250,
  maxZ: 250
};

// 全局变量用于存储其他NPC的包围盒
export let npcBoundingBoxes = [];

export function loadNPC(scene, terrain, callback) {
  const loader = new GLTFLoader();
  loader.load(
    './models/RobotExpressive.glb',
    (gltf) => {
      npc = gltf.scene;
      const x = 300;
      const y = 0;
      const z = 0;

      npc.position.set(x, z, y);
      npc.scale.set(3, 3, 3);
      npc.rotation.y = Math.PI;
      scene.add(npc);

      // 创建一个更合适的包围盒大小
      const center = npc.position.clone();
      const size = new THREE.Vector3(10, 15, 10); 
      const box = new THREE.Box3();
      box.setFromCenterAndSize(center, size);
      
      npcBoundingBox = box;
      
      // 包围盒可视化
      const boxHelper = new THREE.Box3Helper(box, 0xff0000);
      //scene.add(boxHelper);
      
      console.log('主NPC包围盒创建完成:', box);

      npcMixer = new THREE.AnimationMixer(npc);

      // 主角动作
      idleAction = npcMixer.clipAction(gltf.animations[2]);
      walkAction = npcMixer.clipAction(gltf.animations[10]);
      runAction = npcMixer.clipAction(gltf.animations[6]); 
      
      idleAction.play();
      currentAction = idleAction;

      // 回传给主逻辑
      if (callback) callback(npc, npcMixer);
    }
  );
}

// 切换动画动作
function switchAction(newAction) {
  if (currentAction !== newAction) {
    currentAction.fadeOut(0.2);
    newAction.reset().fadeIn(0.2).play();
    currentAction = newAction;
  }
}

// 监听按键
window.addEventListener('keydown', (event) => {
  keyState[event.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (event) => {
  keyState[event.key.toLowerCase()] = false;
});

// 检查碰撞
function checkCollision(newPosition) {
  if (!npcBoundingBox) return false;
  
  // 检查是否超出移动范围
  if (newPosition.x < movementLimits.minX || 
      newPosition.x > movementLimits.maxX || 
      newPosition.z < movementLimits.minZ || 
      newPosition.z > movementLimits.maxZ) {
    console.log('超出移动范围！');
    return true;
  }
  
  // 创建临时包围盒来检查新位置
  const tempBox = npcBoundingBox.clone();
  const offset = new THREE.Vector3().subVectors(newPosition, npc.position);
  tempBox.translate(offset);
  
  // 检查与其他NPC的碰撞
  for (let i = 0; i < npcBoundingBoxes.length; i++) {
    const otherBox = npcBoundingBoxes[i];
    if (otherBox && tempBox.intersectsBox(otherBox)) {
      //console.log('检测到移动碰撞！'); 
      return true;
    }
  }
  
  return false;
}

// 每帧更新 NPC
export function updateNPC(delta, geometry,camera) {
  if (npcMixer) npcMixer.update(delta);

  if (!npc) return;

 const inputDirection = new THREE.Vector3();
if (keyState['w']) inputDirection.z += 1;
if (keyState['s']) inputDirection.z -= 1;
if (keyState['a']) inputDirection.x -= 1;
if (keyState['d']) inputDirection.x += 1;

const isRunning = (keyState['shift'] || keyState['shiftleft']);
const isMoving = inputDirection.lengthSq() > 0;

if (isMoving && camera) {
  inputDirection.normalize();

  // 获取摄像机前向量（忽略Y轴）
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection);
  cameraDirection.y = 0;
  cameraDirection.normalize();

  // 摄像机右向量
  const cameraRight = new THREE.Vector3();
  cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

  // 合成移动方向
  const moveDirection = new THREE.Vector3();
  moveDirection.addScaledVector(cameraDirection, inputDirection.z);
  moveDirection.addScaledVector(cameraRight, inputDirection.x);
  moveDirection.normalize();

  const speed = isRunning ? runSpeed : walkSpeed;
  const newPosition = npc.position.clone().addScaledVector(moveDirection, speed * delta);

  if (!checkCollision(newPosition)) {
    npc.position.copy(newPosition);

    // 平滑朝向移动方向
    const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
    npc.rotation.y = THREE.MathUtils.lerp(npc.rotation.y, targetAngle, 0.2);

    switchAction(isRunning ? runAction : walkAction);
  }
} else {
  switchAction(idleAction);
}
  npc.position.y = 0;
  
  // 更新包围盒位置
  if (npcBoundingBox) {
    // 使用手动更新包围盒位置，避免骨骼动画影响
    const center = npc.position.clone();
    const size = new THREE.Vector3(10, 15, 10); // 固定大小
    npcBoundingBox.setFromCenterAndSize(center, size);
  }
}

// 获取NPC包围盒
export function getNPCBoundingBox() {
  return npcBoundingBox;
}

