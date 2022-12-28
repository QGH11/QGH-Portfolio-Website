
/*  */
class IntroAnimation {
    constructor(scene, camera, renderer, swordScene) {
        this.scene = scene;
        this.camera = camera;   
        this.renderer = renderer;
        this.initializeCoinScene();

        this.coin1 = null;
        this.coin2 = null;

        this.swordScene = swordScene;

        this.control = new THREE_ADDONS.OrbitControls(this.camera, this.renderer.domElement);

        // dynamically changed scene sizes when window resizes
        window.addEventListener( 'resize', onWindowResize, false );
        var self = this;
        function onWindowResize(){
            self.camera.aspect = window.innerWidth / window.innerHeight;
            self.camera.updateProjectionMatrix();

            self.renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }

    initializeCoinScene() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        document.getElementById("intro-scene").appendChild(this.renderer.domElement);
        this.scene.background = new THREE.Color( 0xdddddd);
    }

    /* 
     */
    coinFlip() {
        // Left point light
        const pointLightLeft = new THREE.PointLight(0xff4422, 1);
        pointLightLeft.position.set(-1,-1,3);
        pointLightLeft.name = "coin_pointLightLeft";
        this.scene.add(pointLightLeft);

        // Right point light
        const pointLightRight = new THREE.PointLight(0x44ff88, 1);
        pointLightRight.position.set(1,2,3);
        pointLightRight.name = "coin_pointLightLeft"
        this.scene.add(pointLightRight);

        // Top point light
        const pointLightTop = new THREE.PointLight(0xdd3311, 1);
        pointLightTop.position.set(0,3,2);
        this.scene.add(pointLightTop);

        THREE.ImageUtils.crossOrigin = '';
        // IMPORTANT: This next line defines the texture of your coin. I didn't include the Minecraft texture (for copyright reasons) You should replace the url inside '.load(...)' with the path to your own image.
        const texture = new THREE.TextureLoader().load( "https://raw.githubusercontent.com/pkellz/devsage/master/ThreeJS/MinecraftBlock/devsage.jpg" );

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            metalness:0.7,
            roughness:0.3,
        })

        var geometry1 = new THREE.CylinderGeometry(3, 3, 0.4, 100, 3, false, 1, Math.PI);
        this.coin1 = new THREE.Mesh(geometry1, material);
        this.coin1.material.color.setHex(0xffffff);
        this.coin1.name = "coin1";

        var geometry2 = new THREE.CylinderGeometry(3, 3, 0.4, 100, 3, false, 1+Math.PI, Math.PI);
        this.coin2 = new THREE.Mesh(geometry2, material);

        this.scene.add(this.coin1);
        console.log(this.scene.children)
        this.scene.add(this.coin2);
        this.camera.position.set(0,0,100);

        this.coin1.rotation.x = 2;
        this.coin1.rotation.y = 1.5;

        this.coin2.rotation.x = 2;
        this.coin2.rotation.y = 1.5;

        var self = this;

        function animate()
        {   
            // stop coin flip when cutting
            if (self.camera.position.z === 5) {
                self.coin1.rotation.x = 90;
                self.coin2.rotation.x = 90;
            }
            else {
                self.coin1.rotation.x +=0.015;
                self.coin2.rotation.x +=0.015;
            }

            requestAnimationFrame(animate);
            self.renderer.render(self.scene, self.camera);
        }

        animate()
    }

    sceneControl() {
        // camera
        var t1 = gsap.timeline();
        t1.to(this.camera.position, {duration: 3, z: 5});
        t1.add(this.swordScene.loadCharacter(this.scene, this.camera, this.renderer, "./assets/3DObjects/rose_quartzs_sword/scene.gltf"));
        t1.to(this.coin1.position, {duration: 1, x: -30}, "start")
          .to(this.coin2.position, {duration: 1, x: 30}, "start")
    }

    
}

/* 
 */
class SwordCharacter {
    constructor() {
        this.sword = null;
    }

    loadCharacter(scene, camera, renderer, path) {
        // Instantiate a loader
        const loader = new THREE.GLTFLoader();

        var self = this;
        // Load a glTF resource
        loader.load(
            // resource URL
            path,
            // called when the resource is loaded
            function (gltf) {
                self.sword = gltf.scene.children[0];
                self.sword.scale.set(5,5,5);

                self.sword.position.x = 0;
                self.sword.position.y = 0;
                self.sword.position.z = -3;

                self.sword.rotation.x = 90;
                self.sword.rotation.y = 45;
                self.sword.rotation.z = 90;
                scene.add(gltf.scene);
            },
            // called while loading is progressing
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened: ' + error );
            }
        );
    }
}


window.addEventListener('load', main);

function main() {  
    var scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(125, window.innerWidth/window.innerHeight, 0.1, 1000);    
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    var swordScene = new SwordCharacter();
    var QGHIntro = new IntroAnimation(scene, camera, renderer, swordScene);

    QGHIntro.coinFlip();
    QGHIntro.sceneControl();
}
 
 
function emptyDOM (elem){
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// Creates a DOM element from the given HTML string
function createDOM (htmlString){
    let template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}