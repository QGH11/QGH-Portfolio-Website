import * as THREE from '../../node_modules/three/build/three.module.js';
// import {gsap} from '../../node_modules/gsap/gsap-core.js';
import {GLTFLoader} from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from '../../node_modules/three/examples/jsm/controls/OrbitControls.js'
import BasicCharacterController, {ThirdPersonCamera} from './components/CharacterControls.js'
 
// scene basic setup
var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );  
var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
var container = document.getElementById('bg');
container.appendChild (renderer.domElement);

//  orbitccontrol
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.keys = { LEFT: 0, RIGHT: 0, UP: 0, BOTTOM: 0 }
orbit.minDistance = 20;
orbit.maxDistance = 100;
orbit.minPolarAngle = 0;
orbit.maxPolarAngle = Math.PI / 2 - Math.PI / 16    ;
camera.position.set(30, 30, 30);
orbit.update();

/* Loading */
const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);

loadingManager.onStart = function() {
    console.log("model loding start")
}
loadingManager.onLoad = function () {
    console.log("model loading finished")
    main();
}

function loadCharacter(path, name) {
    gltfLoader.load(
        path, 
        function(gltf) {            
            var object = gltf.scene.children[0]; 
            object.name = name;
            scene.add(object);
        }
    )
}

// models
// loadCharacter("./dist/assets/3DObjects/bananya_birbo/scene.gltf", "BananaCat");  
loadCharacter("./clientV2/assets/3DObjects/dodoco_king/nonmetalscene.glb", "DodocoKing");  


class Character {
    constructor(character, name, speed) {
        this.character = character;
        this.name = name;
        this.speed = speed;

        this.controls;

        
        this._mixers = [];
        this._previousRAF = null;
    }

    loadAnimatedModel() {
        const params = {
          camera: camera,
          scene: scene
        }
        this.controls = new BasicCharacterController(this.character, params);

        this.thirdPersonCamera = new ThirdPersonCamera({
            camera: camera,
            target: this.controls,
        });
    }

    RAF() {
        requestAnimationFrame((t) => {
            if (this._previousRAF === null) {
                this._previousRAF = t;
            }
        
            this.RAF();
        
            render();
            this.Step(t - this._previousRAF);
            this._previousRAF = t;
        });
    }
    
    Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this._mixers) {
            this._mixers.map(m => m.update(timeElapsedS));
        }

        if (this.controls) {    
            this.controls.Update(timeElapsedS);
        }

        // this.thirdPersonCamera.Update(timeElapsedS);
    }
}

class DodocoKing extends Character {
    constructor(character, name) {
        super(character, name, 0.01); 
        this.init();
    }

    init() {
        this.character.position.y = 5;

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set(0, 0, 5);
        directionalLight.shadow.mapSize.x = 2048;
        directionalLight.target = this.character;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
        scene.add(directionalLightHelper);
        this.character.add(directionalLight);
        const axesHelper = new THREE.AxesHelper( 10 );

        this.character.add(axesHelper);

        // axis helper
        const sceneaxesHelper = new THREE.AxesHelper( 10 );
        scene.add( sceneaxesHelper );

        this.CharacterInit();
    }

    CharacterInit() {
        this.loadAnimatedModel();
        this.RAF();
    }
}

class World {
    constructor(dodocoKing) {
        this.ground;

        this.dodocoKing = dodocoKing;
        this.init();
    }

    createPlane() {
        const geometry = new THREE.PlaneGeometry( 100, 100 );
        const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        this.ground = new THREE.Mesh( geometry, material );
        this.ground.rotateX(-Math.PI / 2);
        scene.add(this.ground);

        this.ground.attach(this.dodocoKing.character);
    }

    init() {
        scene.background = new THREE.Color(0xdddddd);

        const ambientLight = new THREE.AmbientLight();
        scene.add(ambientLight);
        
        this.createPlane();
    }
}

/*  */
function main() {
    var dodocoKing = new DodocoKing(scene.children[0], scene.children[0].name);
    var world = new World(dodocoKing, );
}


function animate(time) {
    render();
}
renderer.setAnimationLoop(animate);

function render() {
    renderer.render( scene, camera );
}

// resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
