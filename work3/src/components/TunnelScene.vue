<template>
  <div ref="container" class="tunnel-scene"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'

// refs
const container = ref(null)

let scene, camera, renderer, tube, tubePoints, pointLight

onMounted(() => {
  initScene()
  initCamera()
  initLights()
  createTube()
  initRenderer()
  initControls()
  animate()
  window.addEventListener('resize', onWindowResize, false)
})

function initScene() {
  scene = new THREE.Scene()
  const axesHelper = new THREE.AxesHelper(150)
  scene.add(axesHelper)
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(150, 150, 150)
  camera.lookAt(0, 0, 0)
}

function initLights() {
  pointLight = new THREE.PointLight(0xffffff, 1, 1000)
  pointLight.position.set(50, 50, 200)
  const helper = new THREE.PointLightHelper(pointLight)
  scene.add(helper)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(100, 100, 100)

  scene.add(pointLight)
  scene.add(ambientLight)
  scene.add(dirLight)
}

function createTube() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(100, 0, 0),
    new THREE.Vector3(70, 70, 30),
    new THREE.Vector3(0, 100, 0),
    new THREE.Vector3(-70, 70, -30),
    new THREE.Vector3(-100, 0, 0),
    new THREE.Vector3(-70, -70, 30),
    new THREE.Vector3(0, -100, 0),
    new THREE.Vector3(70, -70, -30),
    new THREE.Vector3(100, 0, 0)
  ], true)

  const geometry = new THREE.TubeGeometry(curve, 200, 10, 20, false)
  const loader = new THREE.TextureLoader()
  const texture = loader.load('/texture.jpg')
  texture.wrapS = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.repeat.x = 20

  const material = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    side: THREE.DoubleSide,
    map: texture,
    aoMap: texture
  })

  tube = new THREE.Mesh(geometry, material)
  tubePoints = curve.getPoints(1000)

  scene.add(tube)
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value.appendChild(renderer.domElement)
}

function initControls() {
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', () => {
    renderer.setClearColor(0x000000, 1)
    renderer.render(scene, camera)
  })
}

let i = 0
function animate() {
  requestAnimationFrame(animate)

  if (i < tubePoints.length - 1) {
    camera.position.copy(tubePoints[i])
    const nextPoint = tubePoints[i + 1]
    camera.lookAt(nextPoint)
    i++
  } else {
    i = 0
  }

  renderer.render(scene, camera)
}

function onWindowResize() {
  if (!renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
</script>

<style scoped>
.tunnel-scene {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
canvas {
  display: block;
}
</style>
