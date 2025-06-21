import * as THREE from "three";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { loadHouses, houseBoundingBoxes, updateHouseBoundingBoxes, houseModels } from "./demo/house.js";
import { loadNPC, updateNPC, npcBoundingBoxes } from "./demo/npc.js";
import { loadNPC12, npc12BoundingBoxes, updateNPC12BoundingBoxes, npc12Models } from "./demo/npc12.js";
import { initCamera, updateCamera } from './demo/camera.js';
import { loadForest, forestBoundingBoxes } from './demo/forest.js';
import { loadFlower, flowerBoundingBoxes } from './demo/flower.js';
import snowflakes from './demo/sprite.js'
import { createDialoguePrompt, createDialogueBubble, showDialogueBubble, hideDialogueBubble, 
         updateDialogueBubblePosition, createNameTag, updateNameTagPosition, 
         checkNPCCollision, handleDialogueSystem, npcDialogues, npcNames } from './demo/dialog.js';
import { createQuestPanel, updateQuestPanel, createPlaceFlowerPrompt, showCompletionMessage,
         createRestartButton, showRestartButton, hideRestartButton } from './demo/quest.js';
import { createMouseTooltip, hideMouseTooltip, playCollectEffect } from './demo/ui.js';
import { updateSnowflakes, applySnowMaterial, restoreOriginalMaterial } from './demo/weather.js';
import { loadFlowers, checkHouseProximity, placeFlowersAtHouse, checkMouseInteraction,
         handleMouseClick, collectFlower, clearCollectedFlowerReferences, updateCollisionSystem } from './demo/interactive.js';
import gsap from 'gsap';

// 游戏全局状态
class GameState {
    constructor() {
        this.gameStarted = false;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.stats = null;
        this.clock = null;
        this.npc = null;
        this.npcMixer = null;
        this.dialoguePrompt = null;
        this.npc12Loaded = false;
        this.housesLoaded = false;
        this.forest = null;
        // 对话系统
        this.dialogueBubble = null;
        this.currentDialogueIndex = 0;
        this.isDialogueActive = false;
        this.activeNPC = null;
        // 任务状态
        this.hasCompletedNPC1Dialogue = false;
        this.hasCompletedTamamoDialogue = false;
        // 花朵收集任务
        this.flowerCollectTaskActive = false;
        this.collectedFlowers = 0;
        this.totalFlowers = 0;
        // 放置花朵任务
        this.readyToPlaceFlowers = false;
        this.flowersPlaced = false;
        this.placeFlowerPrompt = null;
        // UI元素
        this.questPanel = null;
        this.restartButton = null;
        //雪花控制
        this.snowFadeOut = false;
        this.snowFadeAlpha = 0.6; 
        // 鼠标交互
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.mouseTooltip = null;
        this.hoveredFlower = null;
        this.flowerModels = [];
        this.flowerHelpers = [];
        //音效 
        this.audioListener = null;
        this.completeSound = null;
        this.isAudioReady = false;
        // 添加方法引用
        this.applySnowMaterial = applySnowMaterial;
        this.updateQuestPanel = updateQuestPanel;
    }
}

const game = new GameState();

// 初始化游戏
function initGame() {
    createDialoguePrompt(game);
    createDialogueBubble(game);
    createQuestPanel(game);
    createPlaceFlowerPrompt(game);
    createMouseTooltip(game);
    createRestartButton(game);
    
    // 给"再玩一次"按钮添加事件监听
    if (game.restartButton) {
        game.restartButton.addEventListener('click', resetGame);
    }
    
    initGameScene();
    
    // 初始渲染循环
    requestAnimationFrame(() => {
        render();
    });
}

// 初始化游戏场景
function initGameScene() {
    // 场景
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87ceeb);

    // 相机
    game.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    game.camera.position.set(0, 100, 200);

    // 渲染器
    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.shadowMap.enabled = true;
    document.body.appendChild(game.renderer.domElement);

    // 光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    game.scene.add(directionalLight);

    // 初始化音频
    game.audioListener = new THREE.AudioListener();
    game.camera.add(game.audioListener);
    
    // 加载完成音效
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
        './public/models/Quest Complete.mp3', 
        (buffer) => {
            game.completeSound = new THREE.Audio(game.audioListener);
            game.completeSound.setBuffer(buffer);
            game.isAudioReady = true;
            console.log('音效加载完成');
        },
        undefined,
        (err) => console.error('音效加载失败:', err)
    );

    // 将雪花添加到场景中（初始为隐藏）
    snowflakes.forEach(sprite => {
        sprite.visible = false;
        sprite.material.opacity = 0.6; 
        sprite.userData.isSnowflake = true; // 添加标识，以便于查询
        game.scene.add(sprite);
    });

    // 加载森林
    loadForest(game.scene, './public/models/scene.gltf', {
        scale: 1,
        position: { x: 0, y: -1, z: 0 }
    }, (loadedForest) => {
        game.forest = loadedForest;
    });

    // 加载花朵
    loadFlowers(game);

    // 加载房屋
    const houseConfigs = [
        { modelPath: "./public/models/forest_house.glb", position: { x: 100, y: -5, z: -5 } }
    ];
    loadHouses(game.scene, game.forest, houseConfigs);
    
    // 加载NPC
    loadNPC(game.scene, game.forest, (loadedNpc, loadedMixer) => {
        game.npc = loadedNpc;
        game.npcMixer = loadedMixer;//动画

        game.npc.position.set(0, 0, 0);
        initCamera(game.camera, game.npc, game.renderer.domElement);
    });

    // 加载NPC12
    const npc12Configs = [
        {
            modelPath: "./public/models/npc1.gltf",
            scale: 5,
            position: { x: -190, y: 3, z: -80 },
            rotation: { x: 0, y: Math.PI / 3, z: 0 }
        },
        {
            modelPath: "./public/models/tamamo__mgq.glb",
            scale: 2,
            position: { x: 65, y: -10, z: 220 },
            rotation: { x: 0, y: Math.PI, z: 0 }
        }
    ];
    loadNPC12(game.scene, npc12Configs);

    // 窗口大小调整
    window.addEventListener("resize", onWindowResize);
}

// 窗口大小调整
function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

// 重置游戏状态
function resetGame() {
    console.log("重置游戏状态...");
    
    // 隐藏重新开始按钮
    hideRestartButton(game);
    
    // 重置游戏状态变量
    game.hasCompletedNPC1Dialogue = false;
    game.hasCompletedTamamoDialogue = false;
    game.flowerCollectTaskActive = false;
    game.collectedFlowers = 0;
    game.readyToPlaceFlowers = false;
    game.flowersPlaced = false;
    game.currentDialogueIndex = 0;
    game.isDialogueActive = false;
    game.activeNPC = null;
    
    // 重置NPC位置
    if (game.npc) {
        game.npc.position.set(0, 0, 0);
        updateCamera(); // 更新相机跟随
    }
    
    // 移除场景中所有装饰性花朵
    const decorativeFlowers = [];
    game.scene.traverse(object => {
        if (object.userData && object.userData.isDecorative) {
            decorativeFlowers.push(object);
        }
    });
    
    decorativeFlowers.forEach(flower => {
        game.scene.remove(flower);
    });
    
    // 重新加载可收集的花朵
    loadFlowers(game);
    
    // 更新任务面板
    updateQuestPanel('找到魔法师并与他对话', false);
    
    // 恢复森林原始材质
    if (game.forest) {
        restoreOriginalMaterial(game.forest);
    }
}

// 开始游戏
function startGame() {
    if (game.gameStarted) return;
    
    game.gameStarted = true;
    game.clock = new THREE.Clock();
    game.stats = new Stats();
    document.body.appendChild(game.stats.dom);

    // 初始化碰撞检测
    initCollisionDetection();
    
    // 显示任务面板
    game.questPanel.style.display = 'block';

    // 添加键盘事件监听
    window.addEventListener('keydown', (e) => {
        // 对话按键 T
        if (e.key.toLowerCase() === 't') {//忽略大小写
            // 检查是否已在对话中
            if (game.isDialogueActive) {
                // 已在对话中，前进到下一句对话
                const modelPath = game.activeNPC.userData.modelPath;
                const dialogues = npcDialogues[modelPath];
                
                if (game.currentDialogueIndex < dialogues.length - 1) {
                    // 还有更多对话
                    game.currentDialogueIndex++;
                    showDialogueBubble(game, game.activeNPC, modelPath);
                } else {
                    // 对话结束
                    hideDialogueBubble(game);
                    game.currentDialogueIndex = 0;
                }
            }
            // 如果不在对话中，但有对话提示显示
            else if (game.dialoguePrompt.style.display === 'block') {
                const npcIndex = parseInt(game.dialoguePrompt.getAttribute('data-npc-index'));
                const modelPath = game.dialoguePrompt.getAttribute('data-model-path');
                
                // 检查NPC索引是否有效
                if (!isNaN(npcIndex) && npcIndex >= 0 && npcIndex < npc12Models.length) {
                    const npc = npc12Models[npcIndex];
                    game.currentDialogueIndex = 0;
                    showDialogueBubble(game, npc, modelPath);
                }
            }
        }
        
        // 放置花朵按键 P
        if (e.key.toLowerCase() === 'p') {
            // 检查是否在房子附近且已收集所有花朵
            if (game.placeFlowerPrompt.style.display === 'block') {
                placeFlowersAtHouse(game);
            }
        }
    });
    
    // 添加鼠标事件监听
    window.addEventListener('mousemove', (event) => checkMouseInteraction(game, event));
    window.addEventListener('click', (event) => handleMouseClick(game, event));

    document.getElementById('startOverlay').style.display = 'none';
    document.getElementById('loadingText').style.display = 'none';

    // 开始游戏循环
    gameLoop();
}

// 渲染循环（仅渲染）
function render() {
    game.renderer.render(game.scene, game.camera);
    if (!game.gameStarted) {
        requestAnimationFrame(render);
    }
}

// 初始化碰撞检测系统
function initCollisionDetection() {
    // 使用定时器等待资源全部加载完成
    const checkInterval = setInterval(() => {
        if (game.npc12Loaded && game.housesLoaded) {
            clearInterval(checkInterval);
            
            // 初始化全局碰撞检测数组
            npcBoundingBoxes.length = 0;
            
            // 加入所有NPC12的包围盒
            if (npc12BoundingBoxes && npc12BoundingBoxes.length) {
                npcBoundingBoxes.push(...npc12BoundingBoxes);
                //console.log('添加了', npc12BoundingBoxes.length, '个NPC12包围盒到碰撞检测系统');
            }
            
            // 加入所有房子的包围盒
            if (houseBoundingBoxes && houseBoundingBoxes.length) {
                npcBoundingBoxes.push(...houseBoundingBoxes);
                //console.log('添加了', houseBoundingBoxes.length, '个房子包围盒到碰撞检测系统');
            }
            
            // 加入所有非装饰性花朵的包围盒
            const collectableFlowerBoxes = flowerBoundingBoxes.filter(box => 
                box && box.userData && !box.userData.isDecorative && !box.userData.isCollected
            );
            
            if (collectableFlowerBoxes.length) {
                npcBoundingBoxes.push(...collectableFlowerBoxes);
                //console.log('添加了', collectableFlowerBoxes.length, '个花朵包围盒到碰撞检测系统');
            }
            
            //console.log('碰撞检测系统初始化完成，共有', npcBoundingBoxes.length, '个包围盒');
            
            // 为所有NPC创建名字标签
            npc12Models.forEach(npc => {
                if (npc && npc.userData.modelPath) {
                    createNameTag(game, npc, npc12Models);
                }
            });
        }
    }, 100);
}

// 游戏主循环
function gameLoop() {
    const delta = game.clock.getDelta();
    
    // 更新游戏状态
    updateNPC(delta, game.forest, game.camera);
    updateCamera();
    // 更新雪花飘落
    updateSnowflakes(game, delta);
    
    if (game.npc12Loaded) updateNPC12BoundingBoxes();
    if (game.housesLoaded) updateHouseBoundingBoxes();
    
    const collisionInfo = checkNPCCollision(game, npc12Models);
    handleDialogueSystem(game, collisionInfo, npc12Models);
    
    // 检查是否靠近房子
    checkHouseProximity(game);
    
    // 渲染
    game.renderer.render(game.scene, game.camera);
    game.stats.update();
    
    requestAnimationFrame(gameLoop);
}

// 添加音效播放函数到window，以便UI模块调用
window.playCompleteSound = function() {
    if (game.isAudioReady && game.completeSound) {
        game.completeSound.play();
    }
};

window.playPickupSound = function() {
    // 播放拾取音效
    const sound = document.getElementById('pickup-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => {
            console.log('拾取音效播放被阻止，需要用户交互');
        });
    }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    document.getElementById('startButton').addEventListener('click', startGame);
    
    // 模拟资源加载完成
    setTimeout(() => {
        game.npc12Loaded = true;
        game.housesLoaded = true;
        
        if (npc12Models.length > 0) {
            npc12Models[0].userData.modelPath = "./public/models/npc1.gltf";
            if (npc12Models.length > 1) {
                npc12Models[1].userData.modelPath = "./public/models/tamamo__mgq.glb";
            }
        }
    }, 2000);
});