/*  */
class Animation {
    constructor(scene, camera, renderer, htmlControl, swordCharacter) {
        this.scene = scene;
        this.camera = camera;   
        this.renderer = renderer;

        this.htmlControl = htmlControl;

        this.swordCharacter = swordCharacter;

        this.coin1 = null;
        this.coin2 = null;
        this.saturn = null;

        this.particles = new THREE.Group();

        // this.control = new THREE_ADDONS.OrbitControls(this.camera, this.renderer.domElement);

        // state for controling html and three.js elements
        this.state = "Intro"; // "Intro" <-> "AboutMe" <-> "Projects" <-> "Contact"

        this.init();

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
    init() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMappingExposure = 1;
        this.scene.background = new THREE.Color( 0x343435);

        const ambientLight = new THREE.AmbientLight();
        this.scene.add(ambientLight);
      
        const light = new THREE.DirectionalLight();
        light.position.set(200, 100, 200);
        light.castShadow = true;
        light.shadow.camera.left = -100;
        light.shadow.camera.right = 100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this.scene.add(light);

        this.coinFlip();
        this.drawSaturn();
        this.drawParticles();
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

                // should remove light as well
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


    // better planet https://codepen.io/cluzier/pen/mGeEQV
    /*  
        https://codepen.io/elliezen/details/yMqqWe
    */
    drawSaturn() {
        this.saturn = new THREE.Group();
        this.saturn.rotation.set(0.4, 0.3, 0);
        this.saturn.position.x = -1000;
        this.saturn.position.z = -1000;
        this.scene.add(this.saturn);
        
        const planetGeometry = new THREE.IcosahedronGeometry(50, 1);
        
        const planetMaterial = new THREE.MeshPhongMaterial({
          color: 0x37BE95
          });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        planet.castShadow = true;
        planet.receiveShadow = true;
        planet.position.set(0, 40, 0);
        this.saturn.add(planet);
        
        const ringGeometry = new THREE.TorusGeometry(100, 12, 6, 15);
        const ringMeterial = new THREE.MeshStandardMaterial({
          color: 0x6549C0
        });
        const ring = new THREE.Mesh(ringGeometry, ringMeterial);
        ring.position.set(0, 40, 0)
        ring.rotateX(80);
        ring.castShadow = true;
        ring.receiveShadow = true;
        this.saturn.add(ring);
    }
    
    /* https://codepen.io/elliezen/pen/yMqqWe */
    drawParticles() {
        this.scene.add(this.particles);
        const geometry = new THREE.TetrahedronGeometry(5, 0);

        const colors = [0x37BE95, 0xF3F3F3, 0x6549C0];
        const starsNum = 500;

        for (let i = 0; i < starsNum; i ++) {
          const material = new THREE.MeshPhongMaterial({
            color: colors[Math.floor(Math.random() * colors.length)]
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set((Math.random() - 0.5) * 1000,
                            (Math.random() - 0.5) * 1000,
                            (Math.random() - 0.5) * 1000);
          mesh.updateMatrix();
          mesh.matrixAutoUpdate = false;
          this.particles.add(mesh);
        }

        var self = this;
        // slow startAnimation
        function starAnimation() {
            //   Stars Animation  
            for (let i = 0; i < starsNum; i +=2) {
                self.particles.children[i].translateX(0);
                self.particles.children[i + 1].position.x += 0.005;
                // if (self.particles.children[i].position.x > 10)
                // l_velocity_Array[2 * i] += 0.0049;
                // l_velocity_Array[2 * i + 1] += 0.005;

                // l_vertex_Array[6 * i + 2] += l_velocity_Array[2 * i];
                // l_vertex_Array[6 * i + 5] += l_velocity_Array[2 * i + 1];

                // if (self.particles > 10) {
                //     l_vertex_Array[6 * i + 2] = l_vertex_Array[6 * i + 5] = THREE.MathUtils.randInt(-200, 10);
                //     l_velocity_Array[2 * i] = 0;
                //     l_velocity_Array[2 * i + 1] = 0;
                // }
            }



            requestAnimationFrame(starAnimation);
            self.renderer.render(self.scene, self.camera);
        }

        starAnimation();
    }
    
    /*  */
    sceneControl() {
        var self = this;
        var IntroTimmeline = gsap.timeline();
        // var AboutMeTimelIne = gsap.timeline();

        this.swordCharacter.swordAction.then((sword) => {
            if (!this.state.localeCompare("Intro")) {
                // 1. flip Coin
                IntroTimmeline  .to(this.camera.position, {duration: 3, z: 5}, "Init")
                                .to(sword.position, {duration: 3, z: -2}, "Init")

                // 2. Slice coini
                IntroTimmeline  .to(this.coin1.position, {duration: 1, x: -30}, "sliceCoin")
                                .to(this.coin2.position, {duration: 1, x: 30}, "sliceCoin")
                                .to(sword.position, {duration: 0.5, x: -20, y: -20}, "sliceCoin");
                
                // 3. Recover sword position
                IntroTimmeline  .call(function() {
                                    self.scene.remove(self.coin1);
                                    self.scene.remove(self.coin2);
                                }, null)
                                .to(sword.position, {duration: 0.5, x: 0, y: 0})
                                .to(sword.rotation, {duration: 0.5, x: 0, y: 0, z:0}, "positionSword")
                                .to(sword.position, {duration: 0.5, x: -window.innerWidth / window.innerHeight * 7, y: 0}, "positionSword");

                // 4. Interact with HTML elements
                IntroTimmeline  .call(async function() {
                                    self.htmlControl.displayByClassName("Intro-Card");
                                    var txt = 'Hello, I\'m QGH! Somehow I\'m trapped inside this sword...'; /* The text */
                                    var speed = 50; /* The speed/duration of the effect in milliseconds */
                                    await self.htmlControl.typeWriter(txt, speed, "Intro-CardText");

                                    await sleep(1000);

                                    self.htmlControl.displayByClassName("Intro-Card");
                                    var txt = 'Scroll down to explore more!'; /* The text */
                                    var speed = 50; /* The speed/duration of the effect in milliseconds */
                                    await self.htmlControl.typeWriter(txt, speed, "Intro-CardText");
                                }, null, ">");
            }
            else if (!this.state.localeCompare("AboutMe")) {

                // 1. Clean the Intro Card
                IntroTimmeline  .call(this.htmlControl.hidebyClassName("Intro"));

                // 2. Plan to start flying toward saturn
                IntroTimmeline  .to(sword.position, {duration: 0.5, x: 5}, "pointSaturn")
                                .to(sword.rotation, {duration: 0.5, x: -Math.PI / 2, y: Math.PI / 2}, "pointSaturn");

                // 3. Ajust Camera, and start flying (bg start effects) and Introduce About me
                IntroTimmeline  .to(this.camera.rotation, {duration: 0.5, y: -Math.PI / 2}, "adjustCamera")
                                .to(this.camera.position, {duration: 0.5, z: 0}, "adjustCamera")
                                // .call(this.startBackground())


                // allow sword to track mouse cursor
                // document.body.addEventListener('mousemove', (event) => {
                //     this.swordCharacter.onMouseMove(event, sword);
                // })
            }


            // dynamically changed object position based window/canvas size
            window.addEventListener( 'resize', onWindowResize, false);
            function onWindowResize() {
                IntroTimmeline.to(sword.position, {duration: 0.5, x: -window.innerWidth / window.innerHeight * 7, y: 0});
            };
        })
    }   
}

class HTMLControl {
    constructor() {
        this.canvas = document.getElementsByClassName("htmlContent-Container")[0];
    }

    /*  */
    typeWriter(txt, speed, id) {
        //  empty text
        document.getElementById(id).innerHTML = "";

        var i = 0;
        var txt = txt; /* The text */
        var speed = speed; /* The speed/duration of the effect in milliseconds */

        document.body.addEventListener("click", ()=> {
            speed = 10;
        })

        return new Promise((resolve, reject) => {
            function typeWriterHelper() {
                if (i < txt.length) {
                    document.getElementById(id).innerHTML += txt.charAt(i);
                    i++;
                    setTimeout(typeWriterHelper, speed);
                }
                else {
                    resolve(true);
                }
            }

            typeWriterHelper();
        });

    }

    /*  */
    displayByClassName(className) {
        var tagetNode = document.getElementsByClassName(className)[0];
        tagetNode.style.visibility = "visible";
        tagetNode.style.opacity = 1;
    }

    hidebyClassName(className) {
        var tagetNode = document.getElementsByClassName(className)[0];
        tagetNode.style.visibility = "hide";
        tagetNode.style.opacity = 0;
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

class SwordCharacter {
    constructor(scene, camera, renderer) {
        this.swordAction = this.loadCharacter("./assets/3DObjects/rose_quartzs_sword/scene.gltf");
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.pointOfIntersection = new THREE.Vector3(0,0,0);
    }

    modelLoader(path) {
        const loader = new THREE.GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(path, data=> resolve(data), null, reject);
        });
    }

    async loadCharacter(path) {
        const gltf = await this.modelLoader(path);
     
        var sword = gltf.scene.children[0]; 
        sword.scale.set(5,5,5);
        sword.name = "sword";
        sword.position.x = 20;
        sword.position.y = 20;
        sword.position.z = 100;

        sword.rotation.x = - Math.PI / 5;
        sword.rotation.y = - Math.PI / 3;
        sword.rotation.z = - Math.PI / 2;

        this.scene.add(sword);

        return sword;
    }

    // onMouseMove(event, sword) {
    //     // this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    //     // this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //     // this.raycaster.setFromCamera(this.mouse, this.camera);
    //     // this.raycaster.ray.intersectPlane(this.plane, this.pointOfIntersection);
    //     // sword.position.set(this.pointOfIntersection.x, this.pointOfIntersection.y-5, sword.position.z);

    //     // // this.sword.
    //     // sword.rotation.set(sword.rotation.x, sword.rotation.y, Math.atan2(sword.position.y-this.mouse.y, sword.position.x-this.mouse.x));
    //     // console.log( window.innerWidth)
    //     // console.log("Mouth: " + this.mouse.x + " " + this.mouse.y);
    //     // console.log("Mouth: " + event.clientX + " " + event.clientX);
    //     // console.log("Sword: " + sword.position.x + " " + sword.position.y);
    //     // console.log("Inter: " + this.pointOfIntersection.x + " " + this.pointOfIntersection.y)
    // }
}

window.addEventListener('load', main);

/*  */
function main() {  
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(125, window.innerWidth/window.innerHeight, 0.001, 2000);    
    // var camera = new THREE.OrthographicCamera(window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / 2, 1, 1000)
    var renderer = new THREE.WebGLRenderer({antialias: true, canvas: document.querySelector("#bg")});

    var htmlControl = new HTMLControl();
    var swordCharacter = new SwordCharacter(scene, camera, renderer);
    var QGHAnimation = new Animation(scene, camera, renderer, htmlControl, swordCharacter);

    QGHAnimation.sceneControl();

    document.getElementsByClassName("htmlContent-Container")[0].addEventListener("scroll", function() {
        const top = (window.pageYOffset || this.scrollTop)  - (this.clientTop || 0);
        // console.log(top);
        // console.log(QGHAnimation.state);

        // "Other State" -> "AboutMe"
        if (QGHAnimation.state.localeCompare("AboutMe") && top >= 200) {
            QGHAnimation.state = "AboutMe";
            QGHAnimation.sceneControl();
        }
        // // "Other State" -> "Intro"
        // else if (QGHAnimation.state.localeCompare("Intro") && top < 200) {
        //     QGHAnimation.state = "Intro";
        //     QGHAnimation.sceneControl();
        // }
    });
}

/*  */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
