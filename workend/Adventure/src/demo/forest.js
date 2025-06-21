import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 保留数组但不使用
export const forestBoundingBoxes = [];

export function loadForest(scene, modelPath, options = {}, callback) {  // 加了 callback 参数，用于在模型加载完成后执行回调函数
    const {
        scale = 1,
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 }
    } = options;

    const loader = new GLTFLoader();

    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene || gltf;

            model.scale.set(scale, scale, scale);
            model.position.set(position.x, position.y, position.z);
            model.rotation.set(rotation.x, rotation.y, rotation.z);

            //雪贴图
            const snowTexture = new THREE.TextureLoader().load('./public/models/textures/hua.jpg')
            snowTexture.wrapS = snowTexture.wrapT = THREE.RepeatWrapping;

            //遍历模型 保存原贴图并添加雪贴图引用
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (child.material.map) {
                        child.userData.originalMap = child.material.map;
                    }
                    child.userData.snowMap = snowTexture;
                    child.userData.snowMix = 1; 
                    // 初始化材质透明度
                    child.material.transparent = true;
                    child.material.opacity = 1;
                }
            });
            // 添加模型到场景中
            scene.add(model);

            //要执行loadFlower函数，而loadFlower函数需要知道森林模型加载完成，所以需要执行回调函数
            if (callback) callback(model);
        }
    );
}
