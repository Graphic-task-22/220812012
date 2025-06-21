import * as THREE from 'three';

let cameraRef = null;
let targetRef = null;
const originalOffset = new THREE.Vector3(0, 60, 70);
let currentOffset = originalOffset.clone();

// 控制参数
let isMouseDown = false; // 添加这行声明
let previousMousePosition = { x: 0, y: 0 }; // 添加这行声明
let yaw = 0; // 水平旋转角度
const sensitivity = 0.002; // 鼠标灵敏度
const smoothFactor = 0.1; // 平滑过渡系数

// 缩放参数
let zoomDistance = originalOffset.length();
const minZoom = 20;
const maxZoom = 200;
const zoomSpeed = 1.5;

export function initCamera(camera, target, domElement) {
  cameraRef = camera;
  targetRef = target;
  zoomDistance = currentOffset.length();

  // 初始化摄像机位置
  updateCameraPosition();

  // 添加事件监听
  domElement.addEventListener('mousedown', onMouseDown);
  domElement.addEventListener('mouseup', onMouseUp);
  domElement.addEventListener('mousemove', onMouseMove);
  domElement.addEventListener('wheel', onMouseWheel, { passive: false });
}

function updateCameraPosition() {
  if (!targetRef || !cameraRef) return;

  // 只计算水平旋转
  const rotatedOffset = new THREE.Vector3(
    originalOffset.x * Math.cos(yaw) + originalOffset.z * Math.sin(yaw),
    originalOffset.y,
    -originalOffset.x * Math.sin(yaw) + originalOffset.z * Math.cos(yaw)
  ).normalize().multiplyScalar(zoomDistance);

  // 计算期望位置
  const desiredPos = targetRef.position.clone().add(rotatedOffset);
  
  // 平滑移动
  cameraRef.position.lerp(desiredPos, smoothFactor);
  
  // 看向目标点 (稍微高于角色中心)
  const lookAtPoint = targetRef.position.clone();
  lookAtPoint.y += 10;
  cameraRef.lookAt(lookAtPoint);
  
  // 更新当前偏移量
  currentOffset.copy(rotatedOffset);
}

// 鼠标事件处理
function onMouseDown(event) {
  if (event.button === 0) { // 只响应左键
    isMouseDown = true;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }
}

function onMouseUp() {
  isMouseDown = false;
}

function onMouseMove(event) {
  if (!isMouseDown || !cameraRef || !targetRef) return;

  const deltaX = event.clientX - previousMousePosition.x;
  
  // 只更新水平旋转
  yaw -= deltaX * sensitivity;
  
  // 存储当前鼠标X位置
  previousMousePosition.x = event.clientX;
}

// 鼠标滚轮缩放
function onMouseWheel(event) {
  event.preventDefault();
  
  // 调整缩放距离
  zoomDistance -= event.deltaY * 0.05 * zoomSpeed;
  zoomDistance = Math.max(minZoom, Math.min(maxZoom, zoomDistance));
}

export function updateCamera() {
  updateCameraPosition();
}

export function disposeCameraControls(domElement) {
  domElement.removeEventListener('mousedown', onMouseDown);
  domElement.removeEventListener('mouseup', onMouseUp);
  domElement.removeEventListener('mousemove', onMouseMove);
  domElement.removeEventListener('wheel', onMouseWheel);
}