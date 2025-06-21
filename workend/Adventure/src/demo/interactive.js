import * as THREE from "three";
import { loadFlower, flowerBoundingBoxes } from './flower.js';
import { houseModels } from './house.js';
import { npcBoundingBoxes } from './npc.js';
import { showMouseTooltip, hideMouseTooltip, playCollectEffect } from './ui.js';
import { updateQuestPanel, showCompletionMessage } from './quest.js';
import { restoreOriginalMaterial } from './weather.js';

// 加载花朵
export function loadFlowers(game) {
    game.flowerModels = [];
    game.flowerHelpers = [];
    
    const flowerPositions = [
        { x: -50, y: 5, z: 50 },
        { x: -120, y: 5, z: -40 },
        { x: 80, y: 5, z: 160 },
        { x: 30, y: 5, z: -90 },
        { x: -180, y: 5, z: 30 },
        { x: 150, y: 5, z: -120 }
    ];
    
    // 设置总花朵数量
    game.totalFlowers = flowerPositions.length;
    //console.log(`初始化 ${game.totalFlowers} 朵花...`);
    
    flowerPositions.forEach((pos, index) => {
        loadFlower(game.scene, './public/models/flower.gltf', { 
            scale: 5, 
            position: pos 
        }, (flower) => {
            if (flower) {
                flower.userData.flowerId = index;
                flower.userData.isCollected = false;
                game.flowerModels.push(flower);
            }
        });
    });
}

// 检查是否靠近房子
export function checkHouseProximity(game) {
    //如果玩家没有靠近房子，或者没有准备好放置花朵，或者花朵已经放置，则返回false
    if (!game.npc || !game.readyToPlaceFlowers || game.flowersPlaced) return false;
    
    const playerPos = game.npc.position.clone();
    
    // 检查与房子的距离
    for (let i = 0; i < houseModels.length; i++) {
        const house = houseModels[i];
        if (!house) continue;
        
        const housePos = house.position.clone();
        const distance = playerPos.distanceTo(housePos);
        
        // 如果玩家靠近房子
        if (distance < 70) {
            game.placeFlowerPrompt.style.display = 'block';
            return true;
        }
    }
    
    // 不在房子附近
    game.placeFlowerPrompt.style.display = 'none';
    return false;
}

// 放置花朵
export function placeFlowersAtHouse(game) {
    if (!game.readyToPlaceFlowers || game.flowersPlaced) return;
    
    // 标记花朵已放置
    game.flowersPlaced = true;
    
    // 更新任务提示
    updateQuestPanel('任务完成！感谢你帮助收集花朵！', false);
    
    // 隐藏放置提示
    game.placeFlowerPrompt.style.display = 'none';
    
    // 在房子周围创建一些装饰性的花朵模型
    const house = houseModels[0];
    if (house) {
        const housePos = house.position.clone();
        
        // 让花朵分布在不同位置，更加随机和分散
        const positions = [
            { r: 80, a: 0, y: 5 },
            { r: 100, a: Math.PI / 3, y: 8 },
            { r: 75, a: Math.PI * 2 / 3, y: 3 },
            { r: 120, a: Math.PI, y: 6 },
            { r: 90, a: Math.PI * 4 / 3, y: 7 },
            { r: 110, a: Math.PI * 5 / 3, y: 4 }
        ];
        
        for (let i = 0; i < positions.length; i++) {
            const { r, a, y } = positions[i];
            
            // 添加随机偏移，避免完美圆形排列
            const randomOffset = Math.random() * 15 - 7.5; // -7.5 到 7.5 之间的随机值
            const radius = r + randomOffset;
            
            // 计算位置
            const x = housePos.x + Math.cos(a) * radius;
            const z = housePos.z + Math.sin(a) * radius;
            
            // 加载花朵
            loadFlower(game.scene, './public/models/flower.gltf', { 
                scale: 5, 
                position: { x, y, z },
                rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 } // 随机旋转
            }, (flower) => {
                // 标记为装饰性花朵，不参与收集
                if (flower) {
                    flower.userData.isDecorative = true;
                    
                    // 确保花朵包围盒也标记为装饰性
                    const boxIndex = flowerBoundingBoxes.length - 1;
                    if (flowerBoundingBoxes[boxIndex]) {
                        flowerBoundingBoxes[boxIndex].userData = {
                            ...flowerBoundingBoxes[boxIndex].userData,
                            isDecorative: true
                        };
                        
                        // 确保装饰性花朵的包围盒不添加到碰撞系统
                        const collisionBoxIndex = npcBoundingBoxes.indexOf(flowerBoundingBoxes[boxIndex]);
                        if (collisionBoxIndex !== -1) {
                            npcBoundingBoxes.splice(collisionBoxIndex, 1);
                        }
                    }
                }
            });
        }
        
        // 播放音效
        if (window.playCompleteSound) {
            window.playCompleteSound();
        }
        
        showCompletionMessage(game);
        
        // 立即停止下雪
        const snowflakes = game.scene.children.filter(child => 
            child.userData && child.userData.isSnowflake);
        snowflakes.forEach(sprite => {
            sprite.visible = false;
        });
        
        //恢复贴图
        restoreOriginalMaterial(game.forest);
    }
}

// 检查鼠标与花朵的交互
export function checkMouseInteraction(game, event) {
    // 如果对话正在进行或者花朵收集任务未激活，则不处理
    if (game.isDialogueActive || !game.flowerCollectTaskActive) {
        if (game.hoveredFlower) {
            hideMouseTooltip(game);
            game.hoveredFlower = null;
            document.body.style.cursor = 'auto';
        }
        return;
    }
    
    if (!game.flowerModels || !game.flowerModels.length) {
        return;
    }
    
    // 计算鼠标在标准化设备坐标中的位置
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // 更新拾取射线
    game.raycaster.setFromCamera(mouse, game.camera);
    
    // 过滤出未被收集的花朵
    const collectableFlowers = game.flowerModels.filter(flower => 
        flower && flower.userData && !flower.userData.isCollected
    );
    
    if (collectableFlowers.length === 0) {
        if (game.hoveredFlower) {
            hideMouseTooltip(game);
            game.hoveredFlower = null;
            document.body.style.cursor = 'auto';
        }
        return;
    }
    
    // 对可收集的花朵进行相交检测
    const intersects = game.raycaster.intersectObjects(collectableFlowers, true);
    
    // 检查是否有交互对象
    if (intersects.length > 0) {
        // 找到第一个有效交互的花朵
        let validFlower = null;
        for (const intersect of intersects) {
            // 检查对象或其父对象是否是花朵
            let checkObj = intersect.object;
            while (checkObj) {
                if (checkObj.userData && checkObj.userData.isFlowerModel && !checkObj.userData.isCollected) {
                    validFlower = checkObj;
                    break;
                }
                checkObj = checkObj.parent;
            }
            if (validFlower) break;
        }
        
        if (validFlower) {
            const flowerId = validFlower.userData.flowerId;
            
            // 寻找花朵的根对象
            let rootFlower = validFlower;
            while (rootFlower.parent && rootFlower.parent !== game.scene) {
                rootFlower = rootFlower.parent;
            }
            
            if (game.hoveredFlower !== rootFlower) {
                // 更新悬停状态
                game.hoveredFlower = rootFlower;
                
                // 更改鼠标样式
                document.body.style.cursor = 'pointer';
                
                // 显示鼠标提示
                showMouseTooltip(game, event.clientX, event.clientY);
                
                //console.log(`鼠标悬停在花朵 #${flowerId} 上`);
            }
            return;
        }
    }
    
    // 如果没有交互，重置状态
    if (game.hoveredFlower) {
        hideMouseTooltip(game);
        game.hoveredFlower = null;
        document.body.style.cursor = 'auto';
    }
}

// 处理鼠标点击事件
export function handleMouseClick(game, event) {
    // 只有当花朵收集任务激活时才能收集花朵
    if (!game.flowerCollectTaskActive) return;

    // 如果已有悬停花朵，直接收集
    if (game.hoveredFlower && game.hoveredFlower.userData && !game.hoveredFlower.userData.isCollected) {
        const flowerId = game.hoveredFlower.userData.flowerId;
        //console.log(`点击收集花朵 #${flowerId}`);
        collectFlower(game, game.hoveredFlower);
        game.hoveredFlower = null;
        document.body.style.cursor = 'auto';
        hideMouseTooltip(game);
        return;
    }

    // 否则重新进行射线检测（允许用户点击后再触发）
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    game.raycaster.setFromCamera(mouse, game.camera);
    const collectableFlowers = game.flowerModels.filter(flower => 
        flower && flower.userData && !flower.userData.isCollected
    );

    if (collectableFlowers.length === 0) return;

    const intersects = game.raycaster.intersectObjects(collectableFlowers, true);
    if (intersects.length === 0) return;

    let targetFlower = null;
    for (const intersect of intersects) {
        let obj = intersect.object;
        while (obj) {
            if (obj.userData && obj.userData.isFlowerModel && !obj.userData.isCollected) {
                targetFlower = obj;
                break;
            }
            obj = obj.parent;
        }
        if (targetFlower) break;
    }

    if (!targetFlower) return;

    // 找到根对象
    let rootFlower = targetFlower;
    while (rootFlower.parent && rootFlower.parent !== game.scene) {
        rootFlower = rootFlower.parent;
    }

    collectFlower(game, rootFlower);
}

// 收集花朵
export function collectFlower(game, flowerModel) {
    if (!flowerModel || !flowerModel.userData || flowerModel.userData.isCollected) {
        return;
    }
    const flowerId = flowerModel.userData.flowerId;
    //console.log(`收集花朵 #${flowerId}`);

    // 标记模型为已收集
    flowerModel.userData.isCollected = true;
    flowerModel.visible = false; // 只隐藏当前模型

    // 查找并标记对应的包围盒
    const flowerBox = flowerBoundingBoxes.find(box => 
        box && box.userData && box.userData.flowerId === flowerId
    );
    
    if (flowerBox) {
        // 标记包围盒为已收集
        flowerBox.userData.isCollected = true;
        
        // 移除所有与此花朵关联的辅助对象
        game.scene.traverse((object) => {
            // 处理Box3Helper
            if ((object.isBox3Helper || object.isHelper) && object.userData && object.userData.flowerId === flowerId) {
                object.visible = false;
                game.scene.remove(object);
                //console.log(`移除了花朵 #${flowerId} 的Box3Helper`);
            }
        });
        
        // 彻底清除包围盒的物理存在 - 完全移除而不是替换
        for (let i = flowerBoundingBoxes.length - 1; i >= 0; i--) {
            if (flowerBoundingBoxes[i] === flowerBox) {
                flowerBoundingBoxes.splice(i, 1);
                //console.log(`彻底移除了花朵 #${flowerId} 的包围盒，索引:${i}`);
            }
        }
        
        // 确保碰撞系统不包含被收集花朵的任何引用
        clearCollectedFlowerReferences(game, flowerId);
    }
    
    // 更新收集计数
    game.collectedFlowers++;
    updateQuestPanel('收集花朵', true, game.collectedFlowers, game.totalFlowers);
    
    // 播放收集效果
    playCollectEffect(game, flowerModel.position.clone());
    
    // 播放拾取音效
    if (window.playPickupSound) {
        window.playPickupSound();
    }
    
    // 检查是否全部收集完毕
    if (game.collectedFlowers >= game.totalFlowers) {
        updateQuestPanel('所有花朵已收集！请将它们带到房子里', false);
        game.readyToPlaceFlowers = true;
    }
      
    // 隐藏鼠标提示
    hideMouseTooltip(game);
    game.hoveredFlower = null;
    document.body.style.cursor = 'auto';
}

// 彻底清理被收集花朵的所有引用
export function clearCollectedFlowerReferences(game, flowerId) {
    // 正确重建碰撞系统数组
    const filtered = npcBoundingBoxes.filter(box => 
        !(box && box.userData && 
          box.userData.flowerId !== undefined && 
          box.userData.isCollected)
    );
    npcBoundingBoxes.length = 0;
    npcBoundingBoxes.push(...filtered);
    
    // 只移除辅助对象
    game.scene.traverse(object => {
        if (object.userData && 
            object.userData.flowerId === flowerId && 
            !object.userData.isDecorative) {
            // 只处理辅助对象
            if (object.isHelper || object.isBox3Helper) {
                object.visible = false;
                game.scene.remove(object);
            }
        }
    });
}

// 强制更新碰撞系统
export function updateCollisionSystem(game, npc12BoundingBoxes, houseBoundingBoxes) {
    
    // 过滤出非装饰性且未被收集的花朵包围盒
    const activeFlowerBoxes = flowerBoundingBoxes.filter(box => 
        box && box.userData && 
        !box.userData.isDecorative && 
        !box.userData.isCollected
    );
    
    // 清空并重新初始化碰撞系统
    npcBoundingBoxes.length = 0;
    npcBoundingBoxes.push(...npc12BoundingBoxes, ...houseBoundingBoxes, ...activeFlowerBoxes);
    
} 