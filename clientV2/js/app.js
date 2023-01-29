import * as THREE from '../../node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from '../../node_modules/three/examples/jsm/controls/OrbitControls.js'
import BasicCharacterController, {ThirdPersonCamera} from './components/CharacterControls.js'
import Structure from './components/Structure.js';
 
// scene basic setup
var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1.0, 1000 );  
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
orbit.maxPolarAngle = Math.PI / 2 - Math.PI / 16;
orbit.enableZoom = false;
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

var mixers = [];
var actions = [];
var mixer_1;

function loadCharacter(path) {
    gltfLoader.load(
        path, 
        function(gltf) {   
            gltf.scene.traverse( function ( object ) {
                if ( object.isMesh ) {
                  object.castShadow = true;
                }   
            });

            mixer_1 = new THREE.AnimationMixer(gltf.scene);
            mixers.push( mixer_1 );
            const action_1 = mixer_1.clipAction( gltf.animations[0]);
            actions.push(action_1);
            action_1.play();

            scene.add(gltf.scene);
        }
    )
}

function loadStructure(path) {
    gltfLoader.load(
        path, 
        function(gltf) {   
            gltf.scene.traverse( function ( object ) {
                if ( object.isMesh ) {
                  object.castShadow = true;
                }   
            });

            scene.add(gltf.scene);
        }
    )
}

// models
loadCharacter("./clientV2/assets/3DObjects/dodoco_king/dodoco.glb");  
loadStructure("./clientV2/assets/3DObjects/kitty_donout_shop/scene.gltf");

class Character {
    constructor(characterScene) {
        this.characterScene = characterScene;

        this.controls;
        
        this._mixers = mixers;
        this._previousRAF = null;

        this.loadAnimatedModel()
        this.RAF();
    }

    loadAnimatedModel() {
        const params = {
          camera: camera,
          scene: scene
        }
        this.controls = new BasicCharacterController(this.characterScene, params);

        this.thirdPersonCamera = new ThirdPersonCamera({
            camera: camera,
            target: this.controls,
            orbitControl: orbit,
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

        this.thirdPersonCamera.Update(timeElapsedS);
    }
}

class DodocoKing extends Character {
    constructor(characterScene) {
        super(characterScene); 
        this.init();
    }

    init() {
        this.characterScene.position.y = 5;

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set(0, 5, 0);
        directionalLight.shadow.mapSize.x = 2048;
        directionalLight.target = this.characterScene;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
        scene.add(directionalLightHelper);
        this.characterScene.add(directionalLight);


        const axesHelper = new THREE.AxesHelper( 10 );
        this.characterScene.add(axesHelper);
        // axis helper: The X axis is red. The Y axis is green. The Z axis is blue.
        const sceneaxesHelper = new THREE.AxesHelper( 10 );
        scene.add( sceneaxesHelper );
    }
}

class World {
    constructor(dodocoKing, kittyshop) {
        this.ground;
        this.dodocoKing = dodocoKing;

        this.musicbtn = document.getElementsByClassName("toggle-sound")[0];
        this.sound;

        this.kittyshop = kittyshop;


        this.init();

        var self = this;
        // music on and off
        this.musicbtn.addEventListener("click", function() {
            if (self.sound.isPlaying) {
                self.sound.pause();
            }
            else {
                self.sound.play();
            }
            this.classList.toggle('sound-mute');
        });
    }

    createPlane() {
        const geometry = new THREE.PlaneGeometry(200, 200);
        const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        this.ground = new THREE.Mesh( geometry, material );
        this.ground.rotateX(-Math.PI / 2);
        scene.add(this.ground);

        this.ground.attach(this.dodocoKing.characterScene);
    }

    checkCollision() {
        const dodocoKingBB = new THREE.Box3().setFromObject(this.dodocoKing.characterScene.children[0]);
        const kittyshopBB = new THREE.Box3().setFromObject(this.kittyshop.structureScene.children[0]);
        if (dodocoKingBB.intersectsBox(kittyshopBB)) {
            return {id: 0, boxBB: kittyshopBB};
        }

        return {id: -1, boxBB: null};
    }

    init() {
        scene.background = new THREE.Color(0xdddddd);

        const ambientLight = new THREE.AmbientLight();
        scene.add(ambientLight);
        
        this.createPlane();

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // create a global audio source
        this.sound = new THREE.Audio( listener );

        var self = this;
        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( './clientV2/assets/music/GenshinMainTheme.mp3', function( buffer ) {
            self.sound.setBuffer( buffer );
            self.sound.setLoop( true );
            self.sound.setVolume( 0.5 );
            // self.sound.play();
        });
    }
}

/*  */
function main() {
    var dodocoKing = new DodocoKing(scene.children[0]);
    var kittyshop = new Structure(scene.children[1]);
    var world = new World(dodocoKing, kittyshop);

    kittyshop.init(new THREE.Vector3(20, 0, 20), [2, 2, 2],  Math.PI);


    function animate() {
        dodocoKing.controls.collisionHandler(world.checkCollision().boxBB);
        

        requestAnimationFrame(animate);
        render();
    }

    animate();
}

function render() {
    renderer.render(scene, camera);
}

// resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
