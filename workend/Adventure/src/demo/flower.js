import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 添加导出的包围盒数组
export const flowerBoundingBoxes = [];

export function loadFlower(scene, modelPath, options = {}, callback) {
    const {
        scale = 1,
        position = { x: 0, y: 0, z: 0 },
        rotation = { x: 0, y: 0, z: 0 }
    } = options;

    const loader = new GLTFLoader();

    // 当前要创建的花朵索引
    const flowerIndex = flowerBoundingBoxes.length;
    //console.log(`加载花朵 #${flowerIndex}, 位置:`, position);
    
    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene || gltf;

            model.scale.set(scale, scale, scale);
            model.position.set(position.x, position.y, position.z);
            model.rotation.set(rotation.x, rotation.y, rotation.z);
            
            // 首先设置模型的userData，确保在添加到场景前就已有正确的ID
            model.userData = {
                flowerId: flowerIndex,
                isCollected: false,
                isFlowerModel: true // 添加明确的标识符
            };
            
            // 递归设置所有子对象，确保整个模型树都有相同的flowerId
            model.traverse((child) => {
                if (child !== model) {
                    child.userData = {
                        ...child.userData,
                        flowerId: flowerIndex,
                        isCollected: false,
                        isFlowerModel: true
                    };
                }
            });

            scene.add(model);
            
            // 添加花朵的包围盒
            const center = model.position.clone();
            const size = new THREE.Vector3(5, 10, 5); // 花朵的大小
            const boundingBox = new THREE.Box3().setFromCenterAndSize(center, size);
            
            // 设置包围盒的userData
            boundingBox.userData = { 
                flowerId: flowerIndex,
                isCollected: false,
                isFlowerBoundingBox: true 
            };
            
            flowerBoundingBoxes.push(boundingBox);
            
            // 可视化包围盒
            const boxHelper = new THREE.Box3Helper(boundingBox, 0x00ffff);
            boxHelper.userData = {
                flowerId: flowerIndex,
                isFlowerBoundingBoxHelper: true, 
                isHelper: true
            };
            //scene.add(boxHelper);
            
            /* console.log(`花朵 #${flowerIndex} 加载完成:`, {
                model: model.uuid,
                boundingBox: boundingBox,
                position: model.position.clone()
            }); */
            
            if (callback) callback(model);
        },
        // 添加进度回调
        (xhr) => {
            console.log(`花朵 #${flowerIndex} 加载进度: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
        },
        // 添加错误回调
        (error) => {
            console.error(`花朵 #${flowerIndex} 加载出错:`, error);
        }
    );
}
