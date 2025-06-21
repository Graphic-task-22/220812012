import * as THREE from "three";
import { updateQuestPanel } from './quest.js';

// NPC对话内容
export const npcDialogues = {
    "./public/models/npc1.gltf": [
        "你好，旅行者！欢迎来到这个神奇的世界！",
        "我是这片区域的魔法师。",
        "这片森林有很多秘密等待你去探索。",
        "先去找TAMAMO聊聊吧，她会给你一些帮助。",
        "祝你冒险愉快！"
    ],
    "./public/models/tamamo__mgq.glb": [
        "哎呀，又来了一位访客~",
        "我是这片区域的守护者，你可以叫我TAMAMO。",
        "最近开了很多花呢，如果你有空，可以帮我收集一些花朵吗？",
        "看到那边那个房子了吗，把收集来的花放在那里就好。",
        "谢谢你听我说这么多，再见啦！"
    ]
};

// NPC名称
export const npcNames = {
    "./public/models/npc1.gltf": "魔法师",
    "./public/models/tamamo__mgq.glb": "TAMAMO"
};

// 创建对话提示UI
export function createDialoguePrompt(game) {
    game.dialoguePrompt = document.createElement('div');
    game.dialoguePrompt.id = 'dialoguePrompt';
    game.dialoguePrompt.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 16px;
        font-family: 'Arial', sans-serif;
        z-index: 1001;
        display: none;
        text-align: center;
    `;
    game.dialoguePrompt.textContent = '按下T进行对话';
    document.body.appendChild(game.dialoguePrompt);
}

// 创建对话气泡
export function createDialogueBubble(game) {
    game.dialogueBubble = document.createElement('div');
    game.dialogueBubble.id = 'dialogueBubble';
    game.dialogueBubble.style.cssText = `
        position: absolute;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        padding: 15px;
        border-radius: 10px;
        font-size: 16px;
        font-family: 'Arial', sans-serif;
        max-width: 300px;
        min-width: 200px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        display: none;
        text-align: left;
        border: 2px solid #8a5d3b;
        transform: translate(-50%, -120%);
    `;
    
    // 添加NPC名称
    const nameElem = document.createElement('div');
    nameElem.id = 'dialogueName';
    nameElem.style.cssText = `
        font-weight: bold;
        color: #8a5d3b;
        margin-bottom: 8px;
        font-size: 18px;
    `;
    game.dialogueBubble.appendChild(nameElem);
    
    // 添加对话内容
    const contentElem = document.createElement('div');
    contentElem.id = 'dialogueContent';
    game.dialogueBubble.appendChild(contentElem);
    
    // 添加小箭头指向NPC
    const arrow = document.createElement('div');
    arrow.style.cssText = `
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid #8a5d3b;
    `;
    game.dialogueBubble.appendChild(arrow);
    
    // 添加"继续"提示
    const continuePrompt = document.createElement('div');
    continuePrompt.id = 'dialogueContinue';
    continuePrompt.style.cssText = `
        text-align: right;
        font-size: 14px;
        margin-top: 10px;
        font-style: italic;
        color: #666;
    `;
    continuePrompt.textContent = '按T继续...';
    game.dialogueBubble.appendChild(continuePrompt);
    
    document.body.appendChild(game.dialogueBubble);
}

// 显示对话气泡
export function showDialogueBubble(game, npc, modelPath) {
    // 检查是否有对话内容
    if (!npcDialogues[modelPath] || npcDialogues[modelPath].length === 0) {
        console.log(`没有找到 ${modelPath} 的对话内容`);
        return;
    }
    
    // 设置对话状态
    game.isDialogueActive = true;
    game.activeNPC = npc;
    
    // 隐藏对话提示
    game.dialoguePrompt.style.display = 'none';
    
    // 获取当前对话内容
    const dialogues = npcDialogues[modelPath];
    const currentDialogue = dialogues[game.currentDialogueIndex];
    
    // 获取NPC名称
    const npcName = npcNames[modelPath] || "NPC";
    
    // 更新对话气泡内容
    game.dialogueBubble.querySelector('#dialogueName').textContent = npcName;
    game.dialogueBubble.querySelector('#dialogueContent').textContent = currentDialogue;
    
    // 更新继续提示
    const continueElem = game.dialogueBubble.querySelector('#dialogueContinue');
    if (game.currentDialogueIndex < dialogues.length - 1) {
        continueElem.textContent = '按T继续...';
    } else {
        continueElem.textContent = '按T结束对话';
    }
    
    // 显示对话气泡
    game.dialogueBubble.style.display = 'block';
    
    // 更新对话气泡位置
    updateDialogueBubblePosition(game);
    
    // 检查是否是最后一句对话，如果是则更新任务状态
    if (game.currentDialogueIndex === dialogues.length - 1) {
        if (modelPath === "./public/models/npc1.gltf") {
            // 完成与NPC1的对话
            game.hasCompletedNPC1Dialogue = true;
            //开始下雪
            const snowflakes = game.scene.children.filter(child => child.userData && child.userData.isSnowflake);
            snowflakes.forEach(sprite => {
                sprite.visible = true;
                sprite.material.opacity = 0.6;
            });
            game.snowFadeAlpha = 0.6;
            
            // 切为下雪贴图
            if (game.applySnowMaterial) {
                game.applySnowMaterial(game.forest);
            }
        } 
        else if (modelPath === "./public/models/tamamo__mgq.glb") {
            // 完成与TAMAMO的对话，激活花朵收集任务
            game.hasCompletedTamamoDialogue = true;
            game.flowerCollectTaskActive = true;
            updateQuestPanel('收集花朵', true, game.collectedFlowers, game.totalFlowers);
            //console.log('花朵收集任务已激活！');
        }
    }
}

// 隐藏对话气泡
export function hideDialogueBubble(game) {
    game.dialogueBubble.style.display = 'none';
    game.isDialogueActive = false;
    
    // 检查是否完成了与NPC1的对话
    if (game.activeNPC && game.activeNPC.userData.modelPath === "./public/models/npc1.gltf") {
        game.hasCompletedNPC1Dialogue = true;
        updateQuestPanel('找到TAMAMO并与她对话');
    }
    
    // 检查是否完成了与Tamamo的对话
    if (game.activeNPC && game.activeNPC.userData.modelPath === "./public/models/tamamo__mgq.glb") {
        game.hasCompletedTamamoDialogue = true;
        game.flowerCollectTaskActive = true;
        updateQuestPanel('收集花朵', true, game.collectedFlowers, game.totalFlowers);
    }
    
    game.activeNPC = null;
}

// 更新对话气泡位置
export function updateDialogueBubblePosition(game) {
    if (!game.isDialogueActive || !game.activeNPC) return;
    
    // 计算NPC在屏幕上的位置
    const npcPosition = game.activeNPC.position.clone();
    npcPosition.y += 15; 
    const vector = npcPosition.project(game.camera);
    
    // 转换为屏幕坐标
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
    
    // 设置对话气泡位置
    game.dialogueBubble.style.left = `${x}px`;
    game.dialogueBubble.style.top = `${y}px`;
}

// 创建NPC名字标签
export function createNameTag(game, npc, npc12Models) {
    if (!npc || !npc.userData.modelPath) return;
    
    const modelPath = npc.userData.modelPath;
    const npcName = npcNames[modelPath];
    if (!npcName) return;
    
    // 创建名字标签容器
    const nameTag = document.createElement('div');
    nameTag.className = 'npc-name-tag';
    nameTag.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
        font-family: 'Arial', sans-serif;
        z-index: 999;
        pointer-events: none;
        text-align: center;
        transform: translate(-50%, 0);
        white-space: nowrap;
    `;
    nameTag.textContent = npcName;
    nameTag.id = `name-tag-${npc12Models.indexOf(npc)}`;
    document.body.appendChild(nameTag);
    
    npc.userData.nameTag = nameTag;
}

// 更新NPC名字标签位置
export function updateNameTagPosition(game, npc) {
    if (!npc || !npc.userData.nameTag) return;
    
    // 计算NPC在屏幕上的位置
    const npcPosition = npc.position.clone();
    npcPosition.y += 22;
    const vector = npcPosition.project(game.camera);
    
    // 转换为屏幕坐标
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
    
    // 更新标签位置
    const nameTag = npc.userData.nameTag;
    nameTag.style.left = `${x}px`;
    nameTag.style.top = `${y}px`;
    
    // 根据距离调整透明度
    const playerPos = game.npc ? game.npc.position.clone() : null;
    if (playerPos) {
        const distance = playerPos.distanceTo(npc.position);
        const maxVisibleDistance = 100;
        const opacity = Math.max(0, Math.min(1, 1 - (distance - 30) / maxVisibleDistance));
        nameTag.style.opacity = opacity.toString();
    }
}

// 检查NPC碰撞
export function checkNPCCollision(game, npc12Models) {
    if (!game.npc12Loaded || npc12Models.length === 0 || !game.npc) return;

    let nearbyNpc = null;
    let nearbyModelPath = null;
    let minDistance = Infinity;
    const DIALOG_RADIUS = 35;

    // 检查所有NPC
    for (let i = 0; i < npc12Models.length; i++) {
        const npcModel = npc12Models[i];
        if (!npcModel) continue;
        
        const playerPos = game.npc.position.clone();
        const npcPos = npcModel.position.clone();
        const distance = playerPos.distanceTo(npcPos);
        
        // 检查玩家是否靠近NPC，同时处理对话条件
        const isNPC1 = npcModel.userData.modelPath === "./public/models/npc1.gltf";
        const isTamamo = npcModel.userData.modelPath === "./public/models/tamamo__mgq.glb";
        
        // 检查是否允许与该NPC对话
        let canInteract = true;
        if (isTamamo && !game.hasCompletedNPC1Dialogue) {
            canInteract = false; // 未完成与NPC1的对话，不能与Tamamo对话
        }
        
        if (distance <= DIALOG_RADIUS && distance < minDistance && canInteract) {
            minDistance = distance;
            nearbyNpc = npcModel;
            nearbyModelPath = npcModel.userData.modelPath;
        }
    }

    // 显示或隐藏对话提示
    if (nearbyNpc && !game.isDialogueActive) {
        game.dialoguePrompt.style.display = 'block';
        game.dialoguePrompt.setAttribute('data-npc-index', npc12Models.indexOf(nearbyNpc));
        game.dialoguePrompt.setAttribute('data-model-path', nearbyModelPath);
    } else if (!nearbyNpc || game.isDialogueActive) {
        game.dialoguePrompt.style.display = 'none';
    }
    
    return { nearbyNpc, nearbyModelPath };
}

// 处理对话系统
export function handleDialogueSystem(game, collisionInfo, npc12Models) {
    if (!collisionInfo) return;
    const { nearbyNpc, nearbyModelPath } = collisionInfo;
    
    if (game.isDialogueActive) {
        updateDialogueBubblePosition(game);
    }
    
    // 更新所有NPC的名字标签位置
    npc12Models.forEach(npc => {
        if (npc && npc.userData.nameTag) {
            updateNameTagPosition(game, npc);
        }
    });
} 