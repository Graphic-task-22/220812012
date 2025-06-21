import * as THREE from "three";

// 创建任务提示面板
export function createQuestPanel(game) {
    game.questPanel = document.createElement('div');
    game.questPanel.id = 'questPanel';
    game.questPanel.style.cssText = `
        position: fixed;
        top: 80px;
        left: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 15px;
        border-radius: 5px;
        font-size: 16px;
        font-family: 'Arial', sans-serif;
        z-index: 1001;
        display: none;
        text-align: left;
        min-width: 250px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    `;
    
    // 添加标题
    const title = document.createElement('div');
    title.style.cssText = `
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #ffcc33;
    `;
    title.textContent = '当前任务';
    game.questPanel.appendChild(title);
    
    // 添加任务内容
    const content = document.createElement('div');
    content.id = 'questContent';
    content.textContent = '找到魔法师并与他对话';
    game.questPanel.appendChild(content);
    
    // 添加任务进度
    const progress = document.createElement('div');
    progress.id = 'questProgress';
    progress.style.cssText = `
        margin-top: 10px;
        font-size: 14px;
        color: #aaffaa;
        display: none;
    `;
    progress.textContent = '进度: 0/0';
    game.questPanel.appendChild(progress);
    
    document.body.appendChild(game.questPanel);
}

// 更新任务提示内容
export function updateQuestPanel(text, showProgress = false, current = 0, total = 0) {
    const content = document.getElementById('questContent');
    if (content) content.textContent = text;
    
    const progress = document.getElementById('questProgress');
    if (progress) {
        if (showProgress) {
            progress.textContent = `进度: ${current}/${total}`;
            progress.style.display = 'block';
        } else {
            progress.style.display = 'none';
        }
    }
}

// 创建放置花朵提示
export function createPlaceFlowerPrompt(game) {
    game.placeFlowerPrompt = document.createElement('div');
    game.placeFlowerPrompt.id = 'placeFlowerPrompt';
    game.placeFlowerPrompt.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        font-size: 18px;
        font-family: 'Arial', sans-serif;
        z-index: 1002;
        display: none;
        text-align: center;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    `;
    game.placeFlowerPrompt.textContent = '按下P放置花朵';
    document.body.appendChild(game.placeFlowerPrompt);
}

// 创建"再玩一次"按钮
export function createRestartButton(game) {
    // 创建按钮容器
    game.restartButton = document.createElement('div');
    game.restartButton.id = 'restartButton';
    game.restartButton.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 20px;
        font-family: 'Arial', sans-serif;
        font-weight: bold;
        z-index: 1005;
        cursor: pointer;
        display: none;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
    `;
    game.restartButton.textContent = '再玩一次';
    
    // 添加悬停效果
    game.restartButton.onmouseover = () => {
        game.restartButton.style.background = 'linear-gradient(45deg, #45a049, #4CAF50)';
        game.restartButton.style.transform = 'translate(-50%, -50%) scale(1.05)';
        game.restartButton.style.boxShadow = '0 6px 20px rgba(0,0,0,0.5)';
    };
    
    game.restartButton.onmouseout = () => {
        game.restartButton.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        game.restartButton.style.transform = 'translate(-50%, -50%)';
        game.restartButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
    };
    
    // 添加点击效果
    game.restartButton.onmousedown = () => {
        game.restartButton.style.transform = 'translate(-50%, -50%) scale(0.95)';
    };
    
    game.restartButton.onmouseup = () => {
        game.restartButton.style.transform = 'translate(-50%, -50%) scale(1.05)';
    };
    
    document.body.appendChild(game.restartButton);
}

// 显示"再玩一次"按钮
export function showRestartButton(game) {
    // 创建半透明背景
    if (!document.getElementById('restartOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'restartOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            z-index: 1004;
            display: none;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(overlay);
        
        // 在背景点击时也触发重新开始
        overlay.addEventListener('click', () => {
            if (game.restartButton && typeof game.restartButton.onclick === 'function') {
                game.restartButton.onclick();
            }
        });
    }

    const overlay = document.getElementById('restartOverlay');
    
    if (game.restartButton) {
        // 显示半透明背景
        if (overlay) {
            overlay.style.display = 'block';
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 50);
        }
        
        // 淡入效果显示按钮
        game.restartButton.style.display = 'block';
        game.restartButton.style.opacity = '0';
        
        setTimeout(() => {
            game.restartButton.style.opacity = '1';
        }, 100);
    }
}

// 隐藏"再玩一次"
export function hideRestartButton(game) {
    if (game.restartButton) {
        game.restartButton.style.opacity = '0';
        
        setTimeout(() => {
            game.restartButton.style.display = 'none';
        }, 300);
    }
    
    // 隐藏半透明背景
    const overlay = document.getElementById('restartOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
}

// 显示任务完成提示
export function showCompletionMessage(game) {
    const floatingText = document.createElement('div');
    if (window.playCompleteSound) {
        window.playCompleteSound();
    }
    
    floatingText.style.cssText = `
        position: fixed;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ffcc00;
        font-size: 36px;
        font-family: 'Arial', sans-serif;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
        z-index: 1003;
        text-align: center;
        pointer-events: none;
        opacity: 0;
        transition: opacity 1s ease-in-out, transform 1s ease-in-out;
    `;
    floatingText.textContent = '✨ 任务完成！✨';
    document.body.appendChild(floatingText);
    
    // 淡入动画
    setTimeout(() => {
        floatingText.style.opacity = '1';
        floatingText.style.transform = 'translate(-50%, -60%)';
    }, 100);
    
    // 淡出并移除
    setTimeout(() => {
        floatingText.style.opacity = '0';
        floatingText.style.transform = 'translate(-50%, -70%)';
        
        setTimeout(() => {
            document.body.removeChild(floatingText);
            
            showRestartButton(game);
        }, 1000);
    }, 3000);
} 