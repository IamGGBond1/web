// 使用 Three.js 创建全屏背景动画

// 获取.hero容器
const heroSection = document.querySelector('.hero');

// 创建场景
const scene = new THREE.Scene();

// 创建摄像机
const camera = new THREE.PerspectiveCamera(
    75,
    heroSection.offsetWidth / heroSection.offsetHeight,
    0.1,
    1000
);
camera.position.z = 2.5;

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);

// 设置渲染器尺寸为.hero容器的尺寸
const width = heroSection.offsetWidth;
const height = heroSection.offsetHeight;
renderer.setSize(width, height);

// 将渲染器的DOM元素添加到.hero容器中
heroSection.appendChild(renderer.domElement);

// 加载球体纹理
const textureLoader = new THREE.TextureLoader();
const giraffeTexture = textureLoader.load('static/images/giraffe_texture1.png', () => {
    // 纹理加载成功后的回调
    animate(); // 在纹理加载完成后开始动画
}, undefined, (err) => {
    console.error('纹理加载失败:', err);
});

// 创建视频纹理
const video = document.createElement('video');
video.src = 'static/videos/kah.mp4'; // 请确保将GIF转换为视频文件，并路径正确
video.load();
video.muted = true;
video.loop = true;
video.play();

const videoTexture = new THREE.VideoTexture(video);

// 定义球体变量
let sphere;

// 创建球体并添加到场景
function createSphere() {
    // 创建球体几何体
    const geometry = new THREE.SphereGeometry(1, 128, 128);

    // 创建球体的自定义着色器材质
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            giraffeTexture: { value: giraffeTexture } // 使用长颈鹿纹理
        },
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vNormal = normal;
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

                vec3 pos = position;

                // 扭曲效果
                float distortion1 = 0.1 * sin(pos.y * 5.0 + time) * sin(pos.x * 5.0 + time);
                float distortion2 = 0.05 * sin(pos.y * 10.0 + time * 1.5) * cos(pos.x * 10.0 + time);
                float distortion3 = 0.025 * cos(pos.y * 15.0 + time * 2.0) * sin(pos.x * 15.0 + time * 1.5);

                pos.x += distortion1 + distortion2 + distortion3;
                pos.z += distortion1 + distortion2 + distortion3;

                // 修改法向量以配合扭曲效果
                vNormal = normal + vec3(distortion1, distortion2, distortion3);

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D giraffeTexture;
            varying vec2 vUv;

            void main() {
                // 从纹理中获取颜色
                vec4 textureColor = texture2D(giraffeTexture, vUv);

                gl_FragColor = textureColor;
            }
        `,
        wireframe: false
    });

    // 创建球体网格
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
}

// 调用创建球体的函数
createSphere();

// 创建全屏背景平面
const backgroundGeometry = new THREE.PlaneGeometry(40, 40); // 增大平面的大小以覆盖整个屏幕
const backgroundMaterial = new THREE.ShaderMaterial({
    uniforms: {
        videoTexture: { value: videoTexture },
        lightPosition: { value: new THREE.Vector2(0.5, 0.5) } // 初始光源位置
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D videoTexture;
        uniform vec2 lightPosition;
        varying vec2 vUv;

        void main() {
            // 计算距离光源的位置，创建光照效果
            float dist = distance(vUv, lightPosition);
            float lightEffect = 1.0 - smoothstep(0.02, 0.1, dist); // 增大光源范围

            // 从视频纹理中获取颜色
            vec4 textureColor = texture2D(videoTexture, vUv);

            // 在黑色背景和视频之间进行混合，只在光源范围内显示视频
            vec3 color = mix(vec3(0.0), textureColor.rgb, lightEffect);

            gl_FragColor = vec4(color, textureColor.a);
        }
    `,
    transparent: true
});

const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
background.position.z = -5; // 放置在球体的后方
scene.add(background);

// 监听鼠标移动
window.addEventListener('mousemove', (event) => {
    // 将鼠标位置转换为纹理坐标，并纠正偏差
    const mouseX = event.clientX / window.innerWidth;
    const mouseY = 1.0 - (event.clientY / window.innerHeight); // 将Y坐标转换为UV坐标系

    // 更新背景的光照位置，使其紧密跟随鼠标
    backgroundMaterial.uniforms.lightPosition.value.set(mouseX, mouseY);
});

// 调整画布大小
window.addEventListener('resize', () => {
    const width = heroSection.offsetWidth;
    const height = heroSection.offsetHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// 获取按钮并添加点击事件监听器
const enterButton = document.getElementById('enterButton');
enterButton.addEventListener('click', () => {
    // 禁用按钮以防止多次点击
    enterButton.disabled = true;

    // 创建放大球体的动画
    new TWEEN.Tween({ scale: sphere.scale.x, z: camera.position.z })
        .to({ scale: 20, z: camera.position.z + 10 }, 2000) // 放大到20倍，摄像机向后移动10个单位
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(function (object) {
            sphere.scale.set(object.scale, object.scale, object.scale);
            camera.position.z = object.z;
        })
        .onComplete(function () {
            // 在动画结束后，跳转到由 Flask 提供的 URL
            window.location.href = portfolioUrl;
        })
        .start();
});


// 动画循环
function animate() {
    requestAnimationFrame(animate);

    // 更新 TWEEN 动画
    TWEEN.update();

    // 更新 uniform 中的时间
    if (sphere && sphere.material.uniforms.time) {
        sphere.material.uniforms.time.value += 0.01;
    }

    // 渲染场景
    renderer.render(scene, camera);
}

// 不要立即调用 animate()，而是在纹理加载完成后调用
// animate();
