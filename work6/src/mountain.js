import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

const noise2D = createNoise2D();

const geometry = new THREE.PlaneGeometry(500, 500, 80, 80);

const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
});

const cloudMesh = new THREE.Mesh(geometry, material);

//对这些顶点做位置的随机变化实现山脉地形效果
// const positions = geometry.attributes.position;
export function updatePosition() {
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        //   let z = Math.random() * 100;
        //   positions.setZ(i, z);
        
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = noise2D(x/100, y/100) * 50;
        const sinNum = Math.sin(Date.now() * 0.002 + y * 0.05) * 10;
        positions.setZ(i, z + sinNum);
        
        //   console.log(positions.getX(i),positions.getY(i),positions.getZ(i));
    }
    // cloudMash.rotateZ(0.01);
    positions.needsUpdate = true;
}

cloudMesh.rotateX( Math.PI/2 ); //平面旋转

export default cloudMesh;