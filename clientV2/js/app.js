import * as THREE from '../../node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from '../../node_modules/three/examples/jsm/loaders/RGBELoader.js';
import {OrbitControls} from '../../node_modules/three/examples/jsm/controls/OrbitControls.js'
import BasicCharacterController, {ThirdPersonCamera} from './components/CharacterControls.js'
import Structure, {KittyDonoutShop, Contact, Legal, NotFound} from './components/Structure.js';
 
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
const rgbLoader = new RGBELoader(loadingManager);

loadingManager.onStart = function() {
    console.log("model loding start")
}
loadingManager.onProgress = function(url, loaded, total) {
    const progressBar = document.getElementById("progress-bar");
    const progress = (loaded / total) * 100;
    progressBar.innerHTML = progress + "%"; 
    progressBar.style.background = "linear-gradient(to right, rgb(46,229,157)" + progress + "%, white " + (100-progress) + "%)"
}
loadingManager.onLoad = function () {
    const progressBar = document.getElementById("progress-bar");
    progressBar.innerHTML = "CLICK TO ENTER"
    // wait for click to enter
    progressBar.addEventListener("click", function() {
        const progressBarContainer = document.getElementsByClassName("progress-container")[0];
        progressBarContainer.style.display = "none";
        main();
    });
}

var mixers = [];
var actions = [];
var mixer_1;

function loadCharacter(path, name) {
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

            gltf.scene.name = name;
            scene.add(gltf.scene);
        }
    )
}

function loadStructure(path, name) {
    gltfLoader.load(
        path, 
        function(gltf) {   
            gltf.scene.traverse( function ( object ) {
                if ( object.isMesh ) {
                  object.castShadow = true;
                }   
            });

            gltf.scene.name = name;
            scene.add(gltf.scene);
        }
    );
}

function loadHDRTexture(path){
    return rgbLoader.load(
        path, 
        function(){
            sphereHDR.mapping = THREE.EquirectangularReflectionMapping;
        }
    );
}

function loadCity(path, name) {
    gltfLoader.load(
        path, 
        function(gltf) {   
            gltf.scene.name = name;
            scene.add(gltf.scene);
        }
    );
}

// models
loadCharacter("./assets/3DObjects/dodoco_king/dodoco.glb", "dodoco");  
loadStructure("./assets/3DObjects/kitty_donout_shop/kitty_donout_shop.glb", "kittydonoutshop");
const sphereHDR = loadHDRTexture("./assets/textures/venice_sunset_1k.hdr");
loadCity("./assets/3DObjects/City/scene.gltf", "cityEnv");


/* Character Class */
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
            orbitControl: orbit
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

        this.thirdPersonCamera.Update(timeElapsedS, this.controls._input.joystick.dragStart);
    }
}

/* Dodoco */
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
        this.characterScene.add(directionalLight);
        // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
        // scene.add(directionalLightHelper);

        // const axesHelper = new THREE.AxesHelper( 10 );
        // this.characterScene.add(axesHelper);
        // // axis helper: The X axis is red. The Y axis is green. The Z axis is blue.
        // const sceneaxesHelper = new THREE.AxesHelper( 10 );
        // scene.add( sceneaxesHelper );
    }
}

/* The 3D World */
class World {
    constructor(dodocoKing, kittyshop, environment) {
        this.ground;
        this.sphere;
        this.dodocoKing = dodocoKing;
        this.kittyshop = kittyshop;
        this.environment = environment;

        this.sound;

        this.init();

        var self = this;

        // music control
        var controlBtn = document.getElementById('play-pause');

        function playPause() {
            if (self.sound.isPlaying) {
                self.sound.pause();
                controlBtn.className = "play";
            } else { 
                self.sound.play();
                controlBtn.className = "pause";
            }
        }

        controlBtn.addEventListener("click", playPause);
    }

    createPlane() {
        const geometry = new THREE.CircleGeometry(100, 100);
        const material = new THREE.MeshBasicMaterial( {color: 0xffb366, side: THREE.DoubleSide} );
        this.ground = new THREE.Mesh( geometry, material );
        this.ground.rotateX(-Math.PI / 2);
        scene.add(this.ground);
    }

    createGlassSphere() {
        const params = {
            color: 0xffffff,
            transmission: 1,
            opacity: 1,
            metalness: 0,
            roughness: 0,
            envMapIntensity: 1,
        };
        
        const geometry = new THREE.SphereGeometry( 100, 64, 64 );

        const material = new THREE.MeshPhysicalMaterial( {
            color: params.color,
            metalness: params.metalness,
            roughness: params.roughness,
            envMap: sphereHDR,
            envMapIntensity: params.envMapIntensity,
            transmission: params.transmission, // use material.transmission for glass materials
            opacity: params.opacity,
            side: THREE.DoubleSide,
            transparent: true
        } );

        this.sphere = new THREE.Mesh( geometry, material );
        scene.add(this.sphere);
    }

    checkCollision() {
        const dodocoKingBB = new THREE.Box3().setFromObject(this.dodocoKing.characterScene.children[0]);
        const kittyshopBB = new THREE.Box3().setFromObject(this.kittyshop.structureScene.children[0]);
        if (dodocoKingBB.intersectsBox(kittyshopBB)) {
            return {id: 0, boxBB: kittyshopBB};
        }

        return {id: -1, boxBB: null};
    }

    updateEnv() {
        this.environment.rotateX(Math.PI);
        this.environment.position.set(0, 800, 0);
        this.environment.scale.multiplyScalar(5);
    }

    init() {
        scene.background = new THREE.Color(0xdddddd);

        const ambientLight = new THREE.AmbientLight();
        scene.add(ambientLight);
        
        this.createPlane();
        this.createGlassSphere();
        this.updateEnv();

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        camera.add(listener);

        // create a global audio source
        this.sound = new THREE.Audio( listener );

        var self = this;
        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( './assets/music/GenshinMainTheme.mp3', function( buffer ) {
            self.sound.setBuffer( buffer );
            self.sound.setLoop( true );
            self.sound.setVolume( 0.5 );
            self.sound.play();
        });
    }
}

/* main function */
function main() {
    window.addEventListener('popstate', renderRoute);

    var dodocoKing = new DodocoKing(get3DObjectByName("dodoco"));
    var kittyshop = new Structure(get3DObjectByName("kittydonoutshop"));
    var city = get3DObjectByName("cityEnv");
    var world = new World(dodocoKing, kittyshop, city);

    kittyshop.init(new THREE.Vector3(20, 3, 20), [3, 3, 3],  Math.PI);


    var kittydonoutshopPage = new KittyDonoutShop();
    var contactPage = new Contact();
    var legalPage = new Legal();
    var notFoundPage = new NotFound();

    function get3DObjectByName(name) {
        for (let i = 0; i < scene.children.length; i++) {
            if (!scene.children[i].name.localeCompare(name)) {
                return scene.children[i];
            }
        }
    }

    renderRoute() // the appropriate page is rendered upon page load
    // one page website
    function renderRoute() {
        var hash = window.location.hash;
        var pageview = document.getElementById("page-view");

        // create a client-sider "router": single-page application
        if (!hash.localeCompare("#/") || hash === "") {        
            emptyDOM(pageview);
            document.getElementById("page-view").style.zIndex = "-10"
        } 
        else if (!hash.localeCompare("#/kittydonoutshop")) {        
            emptyDOM(pageview);
            pageview.appendChild(kittydonoutshopPage.elem);
            document.getElementById("page-view").style.zIndex = "20"
                        
            // restore page-view z index
            document.getElementsByClassName("page-control")[0].addEventListener("click", function() {
                document.getElementById("page-view").style.zIndex = "-10"
            });
        } 
        else if (!hash.localeCompare("#/projects")) {
            const offset = (120 - dodocoKing.thirdPersonCamera._scroll) / 5;

            if (offset >= 0) {
                let wheelEvent = new WheelEvent('wheel', {
                    deltaY: 1,  
                    deltaMode: 1
                });

                for (let i = 0; i < offset; i++) {
                    document.getElementById('selector').dispatchEvent(wheelEvent);
                }
            }   
            else {
                let wheelEvent = new WheelEvent('wheel', {
                    deltaY: -1,  
                    deltaMode: 1
                });

                for (let i = -offset; i > 0; i--) {
                    document.getElementById('selector').dispatchEvent(wheelEvent);
                }
            }
        }
        else if (!hash.localeCompare("#/legal")) {        
            emptyDOM(pageview);
            pageview.appendChild(legalPage.elem);
            document.getElementById("page-view").style.zIndex = "20"
                        
            // restore page-view z index
            document.getElementsByClassName("page-control")[0].addEventListener("click", function() {
                document.getElementById("page-view").style.zIndex = "-10"
            });
        } 
        else if (!hash.localeCompare("#/contact")) {        
            emptyDOM(pageview);
            pageview.appendChild(contactPage.elem);
            document.getElementById("page-view").style.zIndex = "20"
                        
            // restore page-view z index
            document.getElementsByClassName("page-control")[0].addEventListener("click", function() {
                document.getElementById("page-view").style.zIndex = "-10"
            });
        } 
        else {
            emptyDOM(pageview);
            pageview.appendChild(notFoundPage.elem);
            document.getElementById("page-view").style.zIndex = "20"
                        
            // restore page-view z index
            document.getElementsByClassName("page-control")[0].addEventListener("click", function() {
                document.getElementById("page-view").style.zIndex = "-10"
            });
        }
    }

    // main animation: collision
    function animate() {
        dodocoKing.controls.collisionHandler(world.checkCollision().boxBB);
        kittyshop.collisionHandler(world.checkCollision().id)

        requestAnimationFrame(animate);
        render();
    }
    animate();
}


/* Other helper functions */
function render() {
    renderer.render(scene, camera);
}

function emptyDOM (elem){
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});