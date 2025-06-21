import * as THREE from "three";

// 创建鼠标提示
export function createMouseTooltip(game) {
    game.mouseTooltip = document.createElement('div');
    game.mouseTooltip.id = 'mouseTooltip';
    game.mouseTooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-family: 'Arial', sans-serif;
        z-index: 1002;
        display: none;
        pointer-events: none;
        text-align: center;
        transform: translate(10px, 10px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    `;
    game.mouseTooltip.textContent = '点击收集花朵';
    document.body.appendChild(game.mouseTooltip);
}

// 更新鼠标提示位置
export function updateMouseTooltip(game, x, y) {
    if (game.mouseTooltip) {
        game.mouseTooltip.style.left = `${x}px`;
        game.mouseTooltip.style.top = `${y}px`;
    }
}

// 显示鼠标提示
export function showMouseTooltip(game, x, y) {
    if (game.mouseTooltip) {
        game.mouseTooltip.style.display = 'block';
        updateMouseTooltip(game, x, y);
    }
}

// 隐藏鼠标提示
export function hideMouseTooltip(game) {
    if (game.mouseTooltip) {
        game.mouseTooltip.style.display = 'none';
    }
}

// 播放收集效果
export function playCollectEffect(game, position) {
    // 创建2D收集效果
    const collectText = document.createElement('div');
    
    collectText.style.cssText = `
        position: fixed;
        color: #ffcc00;
        font-size: 24px;
        font-family: 'Arial', sans-serif;
        font-weight: bold;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
        z-index: 1003;
        pointer-events: none;
        opacity: 1;
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    `;
    collectText.textContent = '+1 花朵';
    document.body.appendChild(collectText);
    
    // 将3D位置转换为屏幕坐标
    const screenPosition = position.clone();
    screenPosition.project(game.camera);
    
    // 确保坐标在屏幕内（限制在-1到1之间）
    screenPosition.x = Math.max(-0.9, Math.min(0.9, screenPosition.x));
    screenPosition.y = Math.max(-0.9, Math.min(0.9, screenPosition.y));
    
    // 计算屏幕坐标
    const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(screenPosition.y * 0.5) + 0.5) * window.innerHeight;
    
    // 设置初始位置，确保在屏幕可见区域
    collectText.style.left = `${x}px`;
    collectText.style.top = `${y}px`;
    collectText.style.transform = 'translate(-50%, -50%)';
    
    //console.log(`显示+1花朵提示，屏幕坐标:(${x.toFixed(0)}, ${y.toFixed(0)})`);
    
    // 确认元素已添加到DOM
    requestAnimationFrame(() => {
        // 动画效果
        setTimeout(() => {
            collectText.style.opacity = '0';
            collectText.style.transform = 'translate(-50%, -100px)';
            
            setTimeout(() => {
                if (document.body.contains(collectText)) {
                    document.body.removeChild(collectText);
                }
            }, 800);
        }, 50);
    });
} 