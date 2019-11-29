
let scene = null;

let camera = null;

let renderer = null;

let dom = document.body;

let width = dom.clientWidth;

let height = dom.clientHeight;

let trackList = [];

let earthBall = null;

let type = 'up';


// 世界经纬度对象
var worldGeometry = {};
// 地图颜色
var earthBallColor = '#0E2A42';
// 地图大陆区块颜色
var earthBallPlaneColor = '#fff';


function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(20, width / height, 1, 100000);
    camera.position.set(0, 0, 200);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearAlpha(0.2);
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
        new THREE.MeshBasicMaterial({ color: 0x4682b4 })
    );

    // 旋转圆球
    let saturnLite = new THREE.Mesh(
        new THREE.SphereGeometry(3, 30, 30),
        new THREE.MeshBasicMaterial({ color: 0x4682b4 })
    );

    let canvas = drawText('data '+size);
    let sprite = drawSprite(canvas);

    sprite.position.set(radius, 0, 0);
    
    saturnLite.position.set(radius, 0, 0);
    saturnLite.rotation.x = 1.9;
    
    let t = new THREE.Object3D();
    t.add(saturnLite);
    t.add(sprite);

    let point = new THREE.Object3D();
    point.add(track);
    point.add(t);

    saturnMesh.add(point);
    saturnMesh.rotation.set(-Math.PI * 0.42, Math.PI * 0.02, 0);

    scene.add(saturnMesh);

    return point;
}

function addEarth() {
    earthBall = new THREE.Mesh(
        new THREE.SphereGeometry(10, 50, 50),
        new THREE.MeshBasicMaterial({ 
            map: new THREE.CanvasTexture(createCanvas(2048, 1024, worldGeometry)),
            side: THREE.FrontSide
         })
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


getWorldGeometry();

init();
window.scene = scene;

function render() {
    renderer.render(scene, camera);

    earthBall.rotation.z -= 0.01;
    earthBall.rotation.y -= 0.01;

    trackList.forEach((item, index) => {
        item.rotation.z -= (0.01 + 0.001 * index);
    });

    requestAnimationFrame(render);
}

function drawText(text) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 180;
    canvas.height = 160;
    ctx.fillStyle = "red";
    ctx.font = "14px arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text,70,60);
    return canvas;
}

function drawSprite(canvas) {
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.needsUpdate = true;
    const spritMaterial = new THREE.SpriteMaterial({
        map:canvasTexture
    });
    let sprite = new THREE.Sprite(spritMaterial);

    sprite.scale.set(25,30,1);
    return sprite;
}


// 获取世界经纬度信息函数
function getWorldGeometry () {
    $.ajax({ 
         type : "GET", //提交方式 
         url : "./code/world.json",
         async: false,
         success : function(response) {//返回数据根据结果进行相应的处理 
             worldGeometry = [];
             // 绘制世界地图
            response.features.forEach(function (worldItem, worldItemIndex) {
                var length = worldItem.geometry.coordinates.length;
                var multipleBool = length > 1 ? true : false;
                worldItem.geometry.coordinates.forEach(function (worldChildItem, worldChildItemIndex) {
                    if (multipleBool) {
                        // 值界可以使用的经纬度信息
                        if (worldChildItem.length && worldChildItem[0].length == 2) {
                            worldGeometry.push(worldChildItem);
                        }
                        // 需要转换才可以使用的经纬度信息
                        if (worldChildItem.length && worldChildItem[0].length > 2) {
                            worldChildItem.forEach(function (countryItem, countryItenIndex) {
                                worldGeometry.push(countryItem);
                            })
                        }
                    } else {
                        var countryPos = null;
                        if (worldChildItem.length > 1) {
                            countryPos = worldChildItem;
                        } else {
                            countryPos = worldChildItem[0];
                        }
                        if (countryPos) {
                            worldGeometry.push(countryPos);
                        }
                    }
                })
            })
         } 
    })
}

function createCanvas (w, h, worldPos) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var context = canvas.getContext('2d');
    var centerX = w / 2;
    var centerY = h / 2;
    var average = w / 360;
    // 绘制背景颜色
    context.fillStyle = earthBallColor;
    context.fillRect(0, 0, w, h);
    // canvas中绘制地图方法
    function canvasLineFun (childrenPosition) {
        context.fillStyle = earthBallPlaneColor;
        context.moveTo(centerX + childrenPosition[0][0] * average, centerY - childrenPosition[0][1] * average);
        childrenPosition.forEach(function (posItem) {
            context.lineTo(centerX + posItem[0] * average, centerY - posItem[1] * average);
        })
        context.closePath();
        context.fill();
    }
    worldPos.forEach(function (item) {
        canvasLineFun(item);
    })
    return canvas;
}