
let scene = null;

let camera = null;

let renderer = null;

let dom = document.body;

let width = dom.clientWidth;

let height = dom.clientHeight;

let trackList = [];

let earthBall = null;


function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(20, width / height, 1, 100000);
    camera.position.set(0, 0, 300);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // renderer.setClearAlpha(0.2);
    renderer.setSize(width, height);
    dom.appendChild(renderer.domElement);
}


function addTrackGeometry(radius, size) {

    let saturnMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial()
    );
    
    // 轨道
    let track = new THREE.Mesh(
        new THREE.RingGeometry(radius, radius + 0.1, 50, 1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    // 旋转圆球
    let saturnLite = new THREE.Mesh(
        new THREE.SphereGeometry(size + 1, 30, 30),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    saturnLite.position.set(radius, 0, 0);
    saturnLite.rotation.x = 1.9;

    let point = new THREE.Object3D();
    point.add(track);
    point.add(saturnLite);

    saturnMesh.add(point);
    saturnMesh.rotation.set(-Math.PI * 0.42, Math.PI * 0.02, 0);

    scene.add(saturnMesh);

    return point;
}

function addEarth() {
    earthBall = new THREE.Mesh(
        new THREE.SphereGeometry(10, 50, 50),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    scene.add(earthBall);
}

function init() {
    initScene();
    addEarth();
    for(let i = 1; i < 4; i++) {
        trackList.push(addTrackGeometry((i*2) * 10, i));
    }
    render();
}

init();
window.scene = scene;

function render() {
    renderer.render(scene, camera);

    trackList.forEach((item, index) => {
        item.rotation.z -= (0.01 + 0.001 * index);
    });

    requestAnimationFrame(render);
}