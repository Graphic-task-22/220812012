import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import seedrandom from 'seedrandom';

const rng = seedrandom('mountain-001');
const noise2D = createNoise2D(rng);

const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);

const zMin = 5;
const zMax = 100;

const pos = geometry.attributes.position;
for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    const nx = x * 0.003;
    const ny = y * 0.003;

    let zRaw = (noise2D(nx, ny) + 1) / 2;
    let z = zRaw * (zMax - zMin) + zMin;

    const t = (z - zMin) / (zMax - zMin);
    const ease = t * t;
    z = zMin + ease * (zMax - zMin);

    pos.setZ(i, z);
}

geometry.computeVertexNormals();

// 载入贴图
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('/cao.jpg');
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1); // 可按需更改重复次数

const material = new THREE.MeshStandardMaterial({
    map: texture,
    flatShading: true,
});

const mountain = new THREE.Mesh(geometry, material);
mountain.rotateX(-Math.PI / 2);

export default mountain; 