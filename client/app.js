/*  */
class IntroAnimation {
    constructor(scene, camera, renderer, htmlControl) {
        this.scene = scene;
        this.camera = camera;   
        this.renderer = renderer;
        this.initializeCoinScene();

        this.htmlControl = htmlControl;

        this.coin1 = null;
        this.coin2 = null;

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

    /*  */
    initializeCoinScene() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMappingExposure = 1;
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
        pointLightRight.name = "coin_pointLightLeft";
        this.scene.add(pointLightRight);

        // Top point light
        const pointLightTop = new THREE.PointLight(0xdd3311, 1);
        pointLightTop.position.set(0,3,2);
        pointLightLeft.name = "coin_pointLightLeft";
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
        this.coin2.name = "coin2";

        this.scene.add(this.coin1);
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

    /*  */
    sceneControl(sword) {
        // camera
        var self = this;
        var t1 = gsap.timeline();
        t1  .to(this.camera.position, {duration: 3, z: 5}, "flipCoin")
            .to(sword.position, {duration: 3, z: -2}, "flipCoin");
        t1  .to(this.coin1.position, {duration: 1, x: -30}, "sliceCoin")
            .to(this.coin2.position, {duration: 1, x: 30}, "sliceCoin")
            .to(sword.position, {duration: 0.5, x: -20, y: -20}, "sliceCoin");
        t1  .call(function() {
                self.scene.remove(self.coin1);
                self.scene.remove(self.coin2);
            }, null)
            .to(sword.position, {duration: 0.5, x: 0, y: 0})
            .to(sword.rotation, {duration: 0.5, x: 0, y: 0, z:0}, "positionSword")
            .to(sword.position, {duration: 0.5, x: -window.innerWidth / window.innerHeight * 7, y: 0}, "positionSword");
        t1. call(function() {
            self.htmlControl.displayByClassName("AboutMe-Card");
            var i = 0;
            var txt = 'Hello, I\'m QGH! Somehow I\'m trapped inside this sword...'; /* The text */
            var speed = 50; /* The speed/duration of the effect in milliseconds */
            self.htmlControl.typeWriter(txt, speed, "AboutMe-CardText");
        });

        // dynamically changed object position based window/canvas size
        window.addEventListener( 'resize', onWindowResize, false );
        function onWindowResize() {
            t1.to(sword.position, {duration: 0.5, x: -window.innerWidth / window.innerHeight * 7, y: 0});
        };
    }   
}

class HTMLControl {
    constructor() {

    }

    /*  */
    typeWriter(txt, speed, id) {
        var i = 0;
        var txt = txt; /* The text */
        var speed = speed; /* The speed/duration of the effect in milliseconds */

        function typeWriterHelper() {
            if (i < txt.length) {
                document.getElementById(id).innerHTML += txt.charAt(i);
                i++;
                setTimeout(typeWriterHelper, speed);
            }
        }

        typeWriterHelper();
    }

    /*  */
    displayByClassName(className) {
        var tagetNode = document.getElementsByClassName(className)[0];
        tagetNode.style.visibility = "visible";
        tagetNode.style.opacity = 1;

    }

    /*  */
    emptyDOM (elem){
        while (elem.firstChild) elem.removeChild(elem.firstChild);
    }

    /*  Creates a DOM element from the given HTML string
    * 
    *
    *
    */
    createDOM (htmlString){
        let template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstChild;
    }
}
window.addEventListener('load', main);

/*  */
function main() {  
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(125, window.innerWidth/window.innerHeight, 0.1, 1000);    
    var renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.querySelector("#bg")});

    var htmlControl = new HTMLControl();
    var QGHIntro = new IntroAnimation(scene, camera, renderer, htmlControl);

    QGHIntro.coinFlip();
    loadCharacter("./assets/3DObjects/rose_quartzs_sword/scene.gltf");

    function modelLoader(path) {
        const loader = new THREE.GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(path, data=> resolve(data), null, reject);
        });
    }

    async function loadCharacter(path) {
        const gltf = await modelLoader(path);
     
        var sword = gltf.scene.children[0]; 
        sword.scale.set(5,5,5);
        sword.name = "sword";
        sword.position.x = 20;
        sword.position.y = 20;
        sword.position.z = 100;

        sword.rotation.x = - Math.PI / 5;
        sword.rotation.y = - Math.PI / 3;
        sword.rotation.z = - Math.PI / 2;

        scene.add(sword);

        QGHIntro.sceneControl(sword);
    }
}
