import * as THREE from "three";


//创建雪花纹理数组
const snowflakeTextures=[
    new THREE.TextureLoader().load("./sprites/snowflake1.png"),
    new THREE.TextureLoader().load("./sprites/snowflake2.png"),
    new THREE.TextureLoader().load("./sprites/snowflake3.png"),
    new THREE.TextureLoader().load("./sprites/snowflake4.png"),
    new THREE.TextureLoader().load("./sprites/snowflake5.png"),
    new THREE.TextureLoader().load("./sprites/snowflake6.png"),
    new THREE.TextureLoader().load("./sprites/snowflake7.png"),
];

//创建雪花数组
const snowflakes=[];

for(let i=0;i<50000;i++){//雪花循环
    //随机选择一种雪花材质
    const texture=snowflakeTextures[Math.floor(Math.random()*snowflakeTextures.length)];

    //创建精灵材质
    const spriteMaterial = new THREE.SpriteMaterial({
        depthTest: false, 
        transparent: true, 
        opacity:0.8,
         map:texture,
         blending: THREE.AdditiveBlending, 
     });
     //创建精灵
const sprite=new THREE.Sprite(spriteMaterial);

//精灵随机位置
sprite.position.set(
    (Math.random() - 0.5) * 1000,  // x 轴随机
    Math.random() * 50 + 80,  // y 轴
    (Math.random() - 0.5) * 1000   // z 轴随机
)

//大小随机
sprite.scale.setScalar(Math.random()*0.5+0.3);

snowflakes.push(sprite);
     
}

export default snowflakes;

