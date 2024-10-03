// 使用 Three.js 创建全屏背景动画
const container = document.body;

// 创建场景
const scene = new THREE.Scene();

// 创建摄像机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 创建球体几何体
const geometry = new THREE.SphereGeometry(1, 64, 64);

// 创建自定义着色器材质
const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        lightPosition: { value: new THREE.Vector3(2.0, 2.0, 3.0) } // 光源位置
    },
    vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vUv = uv;
            vNormal = normal; // 传递法向量到片元着色器
            vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

            vec3 pos = position;
            // 扭曲效果
            float distortion = 0.2 * sin(pos.y * 5.0 + time) + 0.2 * sin(pos.x * 5.0 + time);
            pos.x += distortion;
            pos.z += distortion;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 lightPosition;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            // 计算光照
            vec3 lightDir = normalize(lightPosition - vPosition);
            float lightIntensity = max(dot(normalize(vNormal), lightDir), 0.0);

            // 渐变颜色
            vec3 color = vec3(0.2, 0.2, 0.6);
            color.r += vUv.x * 0.5;
            color.g += vUv.y * 0.5;
            color.b += 0.8;

            // 结合光照效果
            color *= lightIntensity;

            gl_FragColor = vec4(color, 1.0);
        }
    `,
    wireframe: false
});

// 创建网格
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// 添加光源
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(2, 2, 3);
scene.add(light);

// 监听窗口大小变化并调整渲染器尺寸
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    // 更新 uniform 中的时间
    sphere.material.uniforms.time.value += 0.01;

    renderer.render(scene, camera);
}

animate();
