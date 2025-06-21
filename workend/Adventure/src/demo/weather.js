import * as THREE from "three";

// 更新雪花飘落逻辑
export function updateSnowflakes(game, delta) {
  const snowflakes = game.scene.children.filter(child => 
    child.userData && child.userData.isSnowflake);
    
  snowflakes.forEach(sprite => {
    if (!sprite.visible) return;

    // 飘落逻辑
    sprite.position.y -= 1.5;

    if (sprite.position.y < 0) {
      sprite.position.y = Math.random() * 200 + 100;
    }

    // 如果处于淡出状态，则慢慢降低透明度
    if (game.snowFadeOut) {
      game.snowFadeAlpha -= delta * 0.013; 
      game.snowFadeAlpha = Math.max(0, game.snowFadeAlpha);

      sprite.material.opacity = game.snowFadeAlpha;

      // 如果已经完全透明，彻底关闭雪花显示
      if (game.snowFadeAlpha <= 0) {
        sprite.visible = false;
        game.snowFadeOut = false; 
      }
    }
  });
}

// 应用雪花材质到模型上
export function applySnowMaterial(model) {
    model.traverse((child) => {
        if (child.isMesh && child.userData.snowMap) {
            child.material.map = child.userData.snowMap;
            child.material.needsUpdate = true;
        }
    });
}

// 恢复原始材质到模型上
export function restoreOriginalMaterial(model) {
    model.traverse((child) => {
        if (child.isMesh && child.userData.originalMap) {
            child.material.map = child.userData.originalMap;
            child.material.needsUpdate = true;
        }
    });
} 