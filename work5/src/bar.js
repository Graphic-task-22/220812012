import * as THREE from 'three';
const groups = new THREE.Group();

function createLine(type) {
    // 创建坐标轴
    const points = [
        new THREE.Vector3(0, 0, 0),
        type === 'y' ? new THREE.Vector3(0, 100, 0) : new THREE.Vector3(120, 0, 0)
    ];

    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2
    });
    return new THREE.Line(geometry, material);
}

function createScaleLine(type) {
  //刻度线
  const points = [];
  for(let i = 0; i <= 100; i+=10) {
    if(type === 'y') {
      points.push(new THREE.Vector3(0, i, 0));
      points.push(new THREE.Vector3(-3, i, 0));
    } else{
      points.push(new THREE.Vector3(i, 0, 0));
      points.push(new THREE.Vector3(i, -3, 0));
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0xcccccc,
    linewidth: 0.01
  });
  return new THREE.LineSegments(geometry, material);
}

function createBar(dataArr) {
  const bars = new THREE.Group();
  const height = 100;

  dataArr.forEach((data, index) => {
    const geometry = new THREE.PlaneGeometry(10, data);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true });

    const position = geometry.getAttribute('position');
    const height = 100;
    const colorArr = [];
    const color1 = new THREE.Color(0xff0000);
    const color2 = new THREE.Color(0x0000ff);
    for (let i = 0; i < position.count; i++) {
      const percent = (position.getY(i) + data / 2) / height;
      const c = color1.clone().lerp(color2, percent);
      colorArr.push(c.r, c.g, c.b);
    }
    const colors = new Float32Array(colorArr);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const bar = new THREE.Mesh(geometry, material);
    bar.position.x = index * 20 + 10 + 5;
    bar.position.y = data / 2;
    bars.add(bar);
  })
  return bars;
}

function createTextLabel(value, x, y) {
    // 创建一个画布
    const canvas = document.createElement('canvas');
    // 获取绘图上下文
    const context = canvas.getContext('2d');
    // 设置画布宽度
    canvas.width = 128;
    // 设置画布高度
    canvas.height = 64;

    // 在画布上绘制一个矩形，填充整个画布
    // 默认颜色是黑色（因为未设置fillStyle时默认是黑）
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 设置字体样式：加粗，字号28px，字体为Arial
    context.font = 'bold 28px Arial';
    // 设置文本水平对齐方式为居中
    context.textAlign = 'center';
    // 设置文本垂直对齐方式为居中（中间）
    context.textBaseline = 'middle';
    // 设置填充文本颜色为白色
    context.fillStyle = '#ffffff';
    // 在画布中间绘制文本内容，文本内容是传入的value参数
    context.fillText(`${value}`, canvas.width / 2, canvas.height / 2);

    // 将画布内容作为纹理生成Three.js纹理对象
    const texture = new THREE.CanvasTexture(canvas);
    // 创建材质，将纹理赋值给材质的贴图属性，支持透明，双面渲染
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });

    // 创建一个平面几何体，宽15，高7，作为标签的平面显示面
    const geometry = new THREE.PlaneGeometry(15, 7);
    // 创建网格对象，由几何体和材质构成
    const mesh = new THREE.Mesh(geometry, material);
    // 设置网格对象的位置到传入的(x, y)坐标，z轴为0（默认平面）
    mesh.position.set(x, y, 0);

    // 返回创建好的文本标签网格对象，可加入Three.js场景中显示
    return mesh;
}

function createTitle(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;

  context.fillRect(0, 0, canvas.width, canvas.height);

  // 设置字体样式：加粗，字号28px，字体为Arial
  context.font = 'bold 28px Arial';
  // 设置文本水平对齐方式为居中
  context.textAlign = 'center';
  // 设置文本垂直对齐方式为居中（中间）
  context.textBaseline = 'middle';

  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, 'red');
  gradient.addColorStop(1, 'blue');
  context.fillStyle = gradient;
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true,side: THREE.DoubleSide });

  const geometry = new THREE.PlaneGeometry(60, 15);
  return new THREE.Sprite(geometry, material);
}


const xLine = createLine('x');
const yLine = createLine('y');
const xScaleLine = createScaleLine('y');
const yScaleLine = createScaleLine('x');

groups.add(xLine, yLine, xScaleLine, yScaleLine);

const dataArr = [10, 20, 30, 70, 50];
const barsGroup = createBar(dataArr);
groups.add(barsGroup);

const title = createTitle("柱状图");
title.position.set(50, 110, 0);
groups.add(title);

export default groups;