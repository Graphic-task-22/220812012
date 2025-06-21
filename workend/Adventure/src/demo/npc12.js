import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// 存储所有NPC12的包围盒
export let npc12BoundingBoxes = [];
// 存储所有NPC12的模型对象
export let npc12Models = [];

export function loadNPC12(scene, configs) {
  const loader = new GLTFLoader();

  configs.forEach((config, index) => {
    const { modelPath, position, scale, rotation } = config;

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        model.scale.set(scale, scale, scale);
        model.position.set(position.x, position.y, position.z);
        model.rotation.set(rotation.x, rotation.y, rotation.z);

        scene.add(model);

        // 存储模型对象和路径信息
        npc12Models[index] = model;
        model.userData.modelPath = modelPath;

        // 创建包围盒（使用模型位置作为中心）
        const center = model.position.clone();
        let size;

        if (modelPath.includes("tamamo")) {
          size = new THREE.Vector3(20, 30, 20);
        } else if (modelPath.includes("npc1")) {
          size = new THREE.Vector3(13, 18, 13);
        } else {
          size = new THREE.Vector3(5, 10, 5);
        }

        const boundingBox = new THREE.Box3().setFromCenterAndSize(center, size);
        npc12BoundingBoxes[index] = boundingBox;

        //console.log(`NPC12 ${index} 包围盒创建完成:`, boundingBox);

        // 可视化包围盒
        const boxHelper = new THREE.Box3Helper(boundingBox, 0x00ff00);
        //scene.add(boxHelper);
      }
    );
  });
}

// 更新所有NPC12的包围盒位置
export function updateNPC12BoundingBoxes() {
  npc12BoundingBoxes.forEach((box, index) => {
    const model = npc12Models[index];
    if (box && model) {
      const modelPath = model.userData.modelPath || "";
      const center = model.position.clone();
      let size;

      if (modelPath.includes("tamamo")) {
        size = new THREE.Vector3(20, 30, 20);
      } else if (modelPath.includes("npc1")) {
        size = new THREE.Vector3(13, 18, 13);
      } else {
        size = new THREE.Vector3(5, 10, 5);
      }

      box.setFromCenterAndSize(center, size);
    }
  });
}
