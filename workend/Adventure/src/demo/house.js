import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// 存储所有房屋的包围盒
export let houseBoundingBoxes = [];
// 存储所有房屋的模型对象
export let houseModels = [];

export function loadHouses(scene, terrain, configs) {
  const loader = new GLTFLoader();

  configs.forEach((config, index) => {
    const { modelPath, position } = config;

    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;
      const { x, y, z } = position;

      model.position.set(x, y, z); // ← 直接使用传入的坐标
      model.scale.set(1000, 1000, 1000); // 放大房子尺寸
      model.rotation.y = Math.PI / 4;

      scene.add(model);

      // 存储模型对象
      houseModels[index] = model;

      // 创建包围盒
      const center = new THREE.Vector3(x - 10, y - 10, z);
      const size = new THREE.Vector3(90, 80, 70); // 放大包围盒尺寸
      const boundingBox = new THREE.Box3().setFromCenterAndSize(center, size);
      houseBoundingBoxes[index] = boundingBox;

      // 可视化调试包围盒
      const boxHelper = new THREE.Box3Helper(boundingBox, 0x0000ff);
      //scene.add(boxHelper);

      console.log(`房屋 ${index} 包围盒创建完成:`, boundingBox);
    });
  });
}

// 更新所有房屋的包围盒位置
export function updateHouseBoundingBoxes() {
  houseBoundingBoxes.forEach((box, index) => {
    const model = houseModels[index];
    if (box && model) {
      // 使用模型位置更新包围盒，但保持自定义大小
      const center = model.position.clone();
      center.y -= 10; // 向下移动固定距离
      center.x -= 10;
      
      // 使用固定大小
      const size = new THREE.Vector3(90, 80, 70); // 放大包围盒尺寸
      
      // 重新设置包围盒
      box.setFromCenterAndSize(center, size);
    }
  });
}