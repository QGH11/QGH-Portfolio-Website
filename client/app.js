/*  */
class Animation {
    constructor(scene, camera, renderer, htmlControl, swordCharacter) {
        this.scene = scene;
        this.camera = camera;   
        this.renderer = renderer;

        this.htmlControl = htmlControl;

        this.swordCharacter = swordCharacter;

        // mesh objects
        this.coin1 = null;
        this.coin2 = null;
        this.saturn = null;
        this.particles = new THREE.Group();

        // animations
        this.coinFlipAnimation;
        this.starAnimation;

        // state for controling html and three.js elements
        // "Intro" <-> "AboutMe" <-> "Projects" <-> "Contact"
        this.state = "Intro"; 


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

        this.drawCoin();
        this.drawSaturn();
        this.drawStars();
        this.drawPlanetWorld();
    }

    /* 
     */
    drawCoin() {
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

        function coinFlip()
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

            self.coinFlipAnimation = requestAnimationFrame(coinFlip);
            self.renderer.render(self.scene, self.camera);
        }

        coinFlip()
    }
    
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
    drawStars() {
        this.scene.add(this.particles);
        const geometry = new THREE.TetrahedronGeometry(5, 0);

        const colors = [0x37BE95, 0xF3F3F3, 0x6549C0];
        const starsNum = 500;

        for (let i = 0; i < starsNum; i ++) {
            const material = new THREE.MeshPhongMaterial({
                color: colors[Math.floor(Math.random() * colors.length)]
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(  (Math.random() - 0.5) * 2000,
                                (Math.random() - 0.5) * 1000,
                                (Math.random() - 0.5) * 1500);
            mesh.rotation.set(  (Math.random()) * 2 * Math.PI,
                                (Math.random()) * 2 * Math.PI,
                                (Math.random()) * 2 * Math.PI);
            mesh.updateMatrix();
            this.particles.add(mesh);
        }

        var self = this;
        // slow startAnimation
        function starAnimation() {
            var speed = 0.049; // Intro speed
            if (!self.state.localeCompare("AboutMe")) {
                speed = 0.49;
            }

            else if (!self.state.localeCompare("Projects")) {
                speed = 0.39;
            }

            //   Stars Animation  
            for (let i = 0; i < starsNum; i +=2) {
                self.particles.children[i].position.z += speed;
                self.particles.children[i + 1].position.z += speed * 1.1;

                if (!self.state.localeCompare("Projects")) {
                    self.particles.children[i].position.x += speed;
                    self.particles.children[i + 1].position.x += speed * 1.1;
                }
                
                if (self.particles.children[i].position.z > 750) {
                    self.particles.children[i].position.set(    (Math.random() - 0.5) * 2000,
                                                                (Math.random() - 0.5) * 1000,
                                                                -700);
                    self.particles.children[i].rotation.set(    (Math.random()) * 2 * Math.PI,
                                                                (Math.random()) * 2 * Math.PI,
                                                                (Math.random()) * 2 * Math.PI);
                }

                if (self.particles.children[i+1].position.z > 750) {
                    self.particles.children[i+1].position.set(  (Math.random() - 0.5) * 2000,
                                                                (Math.random() - 0.5) * 1000,
                                                                -700);
                    self.particles.children[i+1].rotation.set(  (Math.random()) * 2 * Math.PI,
                                                                (Math.random()) * 2 * Math.PI,
                                                                (Math.random()) * 2 * Math.PI);
                }
            }

            self.starAnimation =    (starAnimation);
            self.renderer.render(self.scene, self.camera);
        }

        starAnimation();
    }

    // https://codepen.io/Zultan/pen/mwGZBP
    drawPlanetWorld() {
        var Colors = {
            red:0xf25346,
            yellow:0xedeb27,
            white:0xd8d0d1,
            brown:0x59332e,
            pink:0xF5986E,
            brownDark:0x23190f,
            blue:0x68c3c0,
            green:0x458248,
            purple:0x551A8B,
            lightgreen:0x629265,
        };

        var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;

        function createScene() {
            // Get the width and height of the screen
            // and use them to setup the aspect ratio
            // of the camera and the size of the renderer.
            HEIGHT = window.innerHeight;
            WIDTH = window.innerWidth;

            // Create the scene.
            scene = new THREE.Scene();

            // Add FOV Fog effect to the scene. Same colour as the BG int he stylesheet.
            scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

            // Create the camera
            aspectRatio = WIDTH / HEIGHT;
            fieldOfView = 60;
            nearPlane = 1;
            farPlane = 10000;
            camera = new THREE.PerspectiveCamera(
                fieldOfView,
                aspectRatio,
                nearPlane,
                farPlane
            );
        
            // Position the camera
            camera.position.x = 0;
            camera.position.y = 150;
            camera.position.z = 100;	

            // Create the renderer
            renderer = new THREE.WebGLRenderer ({
            // Alpha makes the background transparent, antialias is performant heavy
                alpha: true,
                antialias:true
            });

            //set the size of the renderer to fullscreen
            renderer.setSize (WIDTH, HEIGHT);
            //enable shadow rendering
            renderer.shadowMap.enabled = true;

            // Add the Renderer to the DOM, in the world div.
            container = document.getElementById('world');
            container.appendChild (renderer.domElement);

            //RESPONSIVE LISTENER
            window.addEventListener('resize', handleWindowResize, false);
        }

        //RESPONSIVE FUNCTION
        function handleWindowResize() {
            HEIGHT = window.innerHeight;
            WIDTH = window.innerWidth;
            renderer.setSize(WIDTH, HEIGHT);
            camera.aspect = WIDTH / HEIGHT;
            camera.updateProjectionMatrix();
        }

        var hemisphereLight, shadowLight;

        function createLights(){
            // Gradient coloured light - Sky, Ground, Intensity
            hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
            // Parallel rays
            shadowLight = new THREE.DirectionalLight(0xffffff, .9);



            shadowLight.position.set(0,350,350);
            shadowLight.castShadow = true;

            // define the visible area of the projected shadow
            shadowLight.shadow.camera.left = -650;
            shadowLight.shadow.camera.right = 650;
            shadowLight.shadow.camera.top = 650;
            shadowLight.shadow.camera.bottom = -650;
            shadowLight.shadow.camera.near = 1;
            shadowLight.shadow.camera.far = 1000;

            // Shadow map size
            shadowLight.shadow.mapSize.width = 2048;
            shadowLight.shadow.mapSize.height = 2048;

            // Add the lights to the scene
            scene.add(hemisphereLight);  

            scene.add(shadowLight);
        }	

        var Land = function(){
            var geom = new THREE.CylinderGeometry(600,600,1700,40,10);
            //rotate on the x axis
            geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
            //create a material
            var mat = new THREE.MeshPhongMaterial({
                color: Colors.lightgreen,
                // // shading:THREE.FlatShading,
                flatShading: true
            });

            //create a mesh of the object
            this.mesh = new THREE.Mesh(geom, mat);
            //receive shadows
            this.mesh.receiveShadow = true;
        }

        var Orbit = function(){
            var geom =new THREE.Object3D();
            this.mesh = geom;
        }

        var Sun = function(){

            this.mesh = new THREE.Object3D();

            var sunGeom = new THREE.SphereGeometry( 400, 20, 10 );
            var sunMat = new THREE.MeshPhongMaterial({
                color: Colors.yellow,
                // // shading:THREE.FlatShading,
                flatShading: true
            });
            var sun = new THREE.Mesh(sunGeom, sunMat);
            //sun.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
            sun.castShadow = false;
            sun.receiveShadow = false;
            this.mesh.add(sun);
        }

        var Cloud = function(){
            // Create an empty container for the cloud
            this.mesh = new THREE.Object3D();
            // Cube geometry and material
            var geom = new THREE.DodecahedronGeometry(20,0);
            var mat = new THREE.MeshPhongMaterial({
                color:Colors.white,  
            });

            var nBlocs = 3+Math.floor(Math.random()*3);

            for (var i=0; i<nBlocs; i++ ){
                //Clone mesh geometry
                var m = new THREE.Mesh(geom, mat);
                    //Randomly position each cube
                    m.position.x = i*15;
                    m.position.y = Math.random()*10;
                    m.position.z = Math.random()*10;
                    m.rotation.z = Math.random()*Math.PI*2;
                    m.rotation.y = Math.random()*Math.PI*2;

                    //Randomly scale the cubes
                    var s = .1 + Math.random()*.9;
                    m.scale.set(s,s,s);
                    this.mesh.add(m);
            }
        }

        var Sky = function(){

            this.mesh = new THREE.Object3D();

            // Number of cloud groups
            this.nClouds = 25;

            // Space the consistenly
            var stepAngle = Math.PI*2 / this.nClouds;

            // Create the Clouds

            for(var i=0; i<this.nClouds; i++){
            
                var c = new Cloud();

                //set rotation and position using trigonometry
                var a = stepAngle*i;
                // this is the distance between the center of the axis and the cloud itself
                var h = 800 + Math.random()*200;
                c.mesh.position.y = Math.sin(a)*h;
                c.mesh.position.x = Math.cos(a)*h;		

                // rotate the cloud according to its position
                c.mesh.rotation.z = a + Math.PI/2;

                // random depth for the clouds on the z-axis
                c.mesh.position.z = -400-Math.random()*400;

                // random scale for each cloud
                var s = 1+Math.random()*2;
                c.mesh.scale.set(s,s,s);

                this.mesh.add(c.mesh);
            }
        }

        var Tree = function () {

            this.mesh = new THREE.Object3D();

            var matTreeLeaves = new THREE.MeshPhongMaterial( { color:Colors.green, // // shading:THREE.FlatShading,
                flatShading: true,
            flatShading: true});

            var geonTreeBase = new THREE.BoxGeometry( 10,20,10 );
            var matTreeBase = new THREE.MeshBasicMaterial( { color:Colors.brown});
            var treeBase = new THREE.Mesh(geonTreeBase,matTreeBase);
            treeBase.castShadow = true;
            treeBase.receiveShadow = true;
            this.mesh.add(treeBase);

            var geomTreeLeaves1 = new THREE.CylinderGeometry(1, 12*3, 12*3, 4 );
            var treeLeaves1 = new THREE.Mesh(geomTreeLeaves1,matTreeLeaves);
            treeLeaves1.castShadow = true;
            treeLeaves1.receiveShadow = true;
            treeLeaves1.position.y = 20
            this.mesh.add(treeLeaves1);

            var geomTreeLeaves2 = new THREE.CylinderGeometry( 1, 9*3, 9*3, 4 );
            var treeLeaves2 = new THREE.Mesh(geomTreeLeaves2,matTreeLeaves);
            treeLeaves2.castShadow = true;
            treeLeaves2.position.y = 40;
            treeLeaves2.receiveShadow = true;
            this.mesh.add(treeLeaves2);

            var geomTreeLeaves3 = new THREE.CylinderGeometry( 1, 6*3, 6*3, 4);
            var treeLeaves3 = new THREE.Mesh(geomTreeLeaves3,matTreeLeaves);
            treeLeaves3.castShadow = true;
            treeLeaves3.position.y = 55;
            treeLeaves3.receiveShadow = true;
            this.mesh.add(treeLeaves3);

        }

        var Flower = function () {

            this.mesh = new THREE.Object3D();

            var geomStem = new THREE.BoxGeometry( 5,50,5,1,1,1 );
            var matStem = new THREE.MeshPhongMaterial( { color:Colors.green, // shading:THREE.FlatShading,
                flatShading: true});
            var stem = new THREE.Mesh(geomStem,matStem);
            stem.castShadow = false;
            stem.receiveShadow = true;
            this.mesh.add(stem);


            var geomPetalCore = new THREE.BoxGeometry(10,10,10,1,1,1);
            var matPetalCore = new THREE.MeshPhongMaterial({color:Colors.yellow, // shading:THREE.FlatShading,
                flatShading: true});
            var petalCore = new THREE.Mesh(geomPetalCore, matPetalCore);
            petalCore.castShadow = false;
            petalCore.receiveShadow = true;

            var petalColor = petalColors [Math.floor(Math.random()*3)];

            var geomPetal = new THREE.BoxGeometry( 15,20,5,1,1,1 );
            var matPetal = new THREE.MeshBasicMaterial( { color:petalColor});
            geomPetal.vertices[5].y-=4;
            geomPetal.vertices[4].y-=4;
            geomPetal.vertices[7].y+=4;
            geomPetal.vertices[6].y+=4;
            geomPetal.translate(12.5,0,3);

                var petals = [];
                for(var i=0; i<4; i++){	

                    petals[i]=new THREE.Mesh(geomPetal,matPetal);
                    petals[i].rotation.z = i*Math.PI/2;
                    petals[i].castShadow = true;
                    petals[i].receiveShadow = true;
                }

            petalCore.add(petals[0],petals[1],petals[2],petals[3]);
            petalCore.position.y = 25;
            petalCore.position.z = 3;
            this.mesh.add(petalCore);

        }

        var petalColors = [Colors.red, Colors.yellow, Colors.blue];

        var Forest = function(){

            this.mesh = new THREE.Object3D();

            // Number of Trees
            this.nTrees = 300;

            // Space the consistenly
            var stepAngle = Math.PI*2 / this.nTrees;

            // Create the Trees

            for(var i=0; i<this.nTrees; i++){
            
                var t = new Tree();

                //set rotation and position using trigonometry
                var a = stepAngle*i;
                // this is the distance between the center of the axis and the tree itself
                var h = 605;
                t.mesh.position.y = Math.sin(a)*h;
                t.mesh.position.x = Math.cos(a)*h;		

                // rotate the tree according to its position
                t.mesh.rotation.z = a + (Math.PI/2)*3;

                //Andreas Trigo funtime
                //t.mesh.rotation.z = Math.atan2(t.mesh.position.y, t.mesh.position.x)-Math.PI/2;

                // random depth for the tree on the z-axis
                t.mesh.position.z = 0-Math.random()*600;

                // random scale for each tree
                var s = .3+Math.random()*.75;
                t.mesh.scale.set(s,s,s);

                this.mesh.add(t.mesh);
            }

            // Number of Trees
            this.nFlowers = 350;

            var stepAngle = Math.PI*2 / this.nFlowers;


            for(var i=0; i<this.nFlowers; i++){	

                var f = new Flower();
                var a = stepAngle*i;

                var h = 605;
                f.mesh.position.y = Math.sin(a)*h;
                f.mesh.position.x = Math.cos(a)*h;		

                f.mesh.rotation.z = a + (Math.PI/2)*3;

                f.mesh.position.z = 0-Math.random()*600;

                var s = .1+Math.random()*.3;
                f.mesh.scale.set(s,s,s);

                this.mesh.add(f.mesh);
            }

        }

        var AirPlane = function() {
            
            this.mesh = new THREE.Object3D();

            // Create the cabin
            var geomCockpit = new THREE.BoxGeometry(80,50,50,1,1,1);
            var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, // shading:THREE.FlatShading,
                flatShading: true});
            geomCockpit.vertices[4].y-=10;
            geomCockpit.vertices[4].z+=20;
            geomCockpit.vertices[5].y-=10;
            geomCockpit.vertices[5].z-=20;
            geomCockpit.vertices[6].y+=30;
            geomCockpit.vertices[6].z+=20;
            geomCockpit.vertices[7].y+=30;
            geomCockpit.vertices[7].z-=20;
            var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
            cockpit.castShadow = true;
            cockpit.receiveShadow = true;
            this.mesh.add(cockpit);
            
            // Create the engine
            var geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
            var matEngine = new THREE.MeshPhongMaterial({color:Colors.white, // shading:THREE.FlatShading,
                flatShading: true});
            var engine = new THREE.Mesh(geomEngine, matEngine);
            engine.position.x = 40;
            engine.castShadow = true;
            engine.receiveShadow = true;
            this.mesh.add(engine);
            
            // Create the tail
            var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
            var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, // shading:THREE.FlatShading,
                flatShading: true});
            var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
            tailPlane.position.set(-35,25,0);
            tailPlane.castShadow = true;
            tailPlane.receiveShadow = true;
            this.mesh.add(tailPlane);
            
            // Create the wing
            var geomSideWing = new THREE.BoxGeometry(40,4,150,1,1,1);
            var matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, // shading:THREE.FlatShading,
                flatShading: true});

            var sideWingTop = new THREE.Mesh(geomSideWing, matSideWing);
            var sideWingBottom = new THREE.Mesh(geomSideWing, matSideWing);
            sideWingTop.castShadow = true;
            sideWingTop.receiveShadow = true;
            sideWingBottom.castShadow = true;
            sideWingBottom.receiveShadow = true;

            sideWingTop.position.set(20,12,0);
            sideWingBottom.position.set(20,-3,0);
            this.mesh.add(sideWingTop);
            this.mesh.add(sideWingBottom);

            var geomWindshield = new THREE.BoxGeometry(3,15,20,1,1,1);
            var matWindshield = new THREE.MeshPhongMaterial({color:Colors.white,transparent:true, opacity:.3, // shading:THREE.FlatShading,
                flatShading: true});;
            var windshield = new THREE.Mesh(geomWindshield, matWindshield);
            windshield.position.set(5,27,0);

            windshield.castShadow = true;
            windshield.receiveShadow = true;

            this.mesh.add(windshield);

            var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
            geomPropeller.vertices[4].y-=5;
            geomPropeller.vertices[4].z+=5;
            geomPropeller.vertices[5].y-=5;
            geomPropeller.vertices[5].z-=5;
            geomPropeller.vertices[6].y+=5;
            geomPropeller.vertices[6].z+=5;
            geomPropeller.vertices[7].y+=5;
            geomPropeller.vertices[7].z-=5;
            var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, // shading:THREE.FlatShading,
                flatShading: true});
            this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
            this.propeller.castShadow = true;
            this.propeller.receiveShadow = true;


            var geomBlade1 = new THREE.BoxGeometry(1,100,10,1,1,1);
            var geomBlade2 = new THREE.BoxGeometry(1,10,100,1,1,1);
            var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, // shading:THREE.FlatShading,
                flatShading: true});
            
            var blade1 = new THREE.Mesh(geomBlade1, matBlade);
            blade1.position.set(8,0,0);
            blade1.castShadow = true;
            blade1.receiveShadow = true;

            var blade2 = new THREE.Mesh(geomBlade2, matBlade);
            blade2.position.set(8,0,0);
            blade2.castShadow = true;
            blade2.receiveShadow = true;
            this.propeller.add(blade1, blade2);
            this.propeller.position.set(50,0,0);
            this.mesh.add(this.propeller);

            var wheelProtecGeom = new THREE.BoxGeometry(30,15,10,1,1,1);
            var wheelProtecMat = new THREE.MeshPhongMaterial({color:Colors.white, // shading:THREE.FlatShading,
                flatShading: true});
            var wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
            wheelProtecR.position.set(25,-20,25);
            this.mesh.add(wheelProtecR);

            var wheelTireGeom = new THREE.BoxGeometry(24,24,4);
            var wheelTireMat = new THREE.MeshPhongMaterial({color:Colors.brownDark, // shading:THREE.FlatShading,
                flatShading: true});
            var wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
            wheelTireR.position.set(25,-28,25);

            var wheelAxisGeom = new THREE.BoxGeometry(10,10,6);
            var wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.brown, // shading:THREE.FlatShading,
                flatShading: true});
            var wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
            wheelTireR.add(wheelAxis);

            this.mesh.add(wheelTireR);

            var wheelProtecL = wheelProtecR.clone();
            wheelProtecL.position.z = -wheelProtecR.position.z ;
            this.mesh.add(wheelProtecL);

            var wheelTireL = wheelTireR.clone();
            wheelTireL.position.z = -wheelTireR.position.z;
            this.mesh.add(wheelTireL);

            var wheelTireB = wheelTireR.clone();
            wheelTireB.scale.set(.5,.5,.5);
            wheelTireB.position.set(-35,-5,0);
            this.mesh.add(wheelTireB);

            var suspensionGeom = new THREE.BoxGeometry(4,20,4);
            suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0))
            var suspensionMat = new THREE.MeshPhongMaterial({color:Colors.red, // shading:THREE.FlatShading,
                flatShading: true});
            var suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
            suspension.position.set(-35,-5,0);
            suspension.rotation.z = -.3;
            this.mesh.add(suspension);
        };


        var sky;
        var forest;
        var land;
        var orbit;
        var airplane;
        var sun;

        var mousePos={x:0, y:0};
        var offSet = -600;

        function createSky(){
            sky = new Sky();
            sky.mesh.position.y = offSet;
            scene.add(sky.mesh);
        }

        function createLand(){
            land = new Land();
            land.mesh.position.y = offSet;
            scene.add(land.mesh);
        }

        function createOrbit(){
            orbit = new Orbit();
            orbit.mesh.position.y = offSet;
            orbit.mesh.rotation.z = -Math.PI/6; 
            scene.add(orbit.mesh);
        }

        function createForest(){
        forest = new Forest();
        forest.mesh.position.y = offSet;
        scene.add(forest.mesh);
        }

        function createSun(){ 
            sun = new Sun();
            sun.mesh.scale.set(1,1,.3);
            sun.mesh.position.set(0,-30,-850);
            scene.add(sun.mesh);
        }

        function createPlane(){ 
            airplane = new AirPlane();
            airplane.mesh.scale.set(.35,.35,.35);
            airplane.mesh.position.set(-40,110,-250);
            airplane.mesh.rotation.z = Math.PI/15;
            scene.add(airplane.mesh);
        }

        function updatePlane() {
            var targetY = normalize(mousePos.y,-.75,.75, 50, 190);
            var targetX = normalize(mousePos.x,-.75,.75,-100, -20);
            
            // Move the plane at each frame by adding a fraction of the remaining distance
            airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*0.1;

            airplane.mesh.position.x += (targetX-airplane.mesh.position.x)*0.1;

            // Rotate the plane proportionally to the remaining distance
            airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*0.0128;
            airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*0.0064;
            airplane.mesh.rotation.y = (airplane.mesh.position.x-targetX)*0.0064;

            airplane.propeller.rotation.x += 0.3;
        }

        function normalize(v,vmin,vmax,tmin, tmax){

            var nv = Math.max(Math.min(v,vmax), vmin);
            var dv = vmax-vmin;
            var pc = (nv-vmin)/dv;
            var dt = tmax-tmin;
            var tv = tmin + (pc*dt);
            return tv;

        }

        function loop(){
            // land.mesh.rotation.z += .005;
            // orbit.mesh.rotation.z += .001;
            // sky.mesh.rotation.z += .003;
            // forest.mesh.rotation.z += .005;
            updatePlane();

            renderer.render(scene, camera);
            requestAnimationFrame(loop);
        }

        function handleMouseMove (event) {
            var tx = -1 + (event.clientX / WIDTH)*2;
            var ty = 1 - (event.clientY / HEIGHT)*2;
            mousePos = {x:tx, y:ty};	
        }

        function init() {
            createScene();
            createLights();
            createPlane();
            createOrbit();
            // createSun();
            createLand();
            createForest();
            // createSky();

            document.addEventListener('mousemove', handleMouseMove, false);

            loop();
        }

        init();
    }
    
    /*  */
    sceneControl() {
        var self = this;
        var mainTimeline = gsap.timeline();

        this.swordCharacter.swordAction.then((sword) => {
            if (!this.state.localeCompare("Intro")) {
                // 1. flip Coin
                mainTimeline    .to(this.camera.position, {duration: 3, z: 5}, "Init")
                                .to(sword.position, {duration: 3, z: -2}, "Init")

                // 2. Slice coini
                mainTimeline    .to(this.coin1.position, {duration: 1, x: -30}, "sliceCoin")
                                .to(this.coin2.position, {duration: 1, x: 30}, "sliceCoin")
                                .to(sword.position, {duration: 0.5, x: -20, y: -20}, "sliceCoin");
                
                // 3. Recover sword position
                mainTimeline    .call(function() {
                                    self.scene.remove(self.coin1);
                                    self.scene.remove(self.coin2);
                                }, null)
                                .to(sword.position, {duration: 0.5, x: 0, y: 0})
                                .to(sword.rotation, {duration: 0.5, x: 0, y: 0, z:0}, "positionSword")
                                .to(sword.position, {duration: 0.5, x: -window.innerWidth / window.innerHeight * 7, y: 0}, "positionSword");

                // 4. Interact with HTML elements
                mainTimeline    .call(async function() {
                                    self.htmlControl.displayByClassName("Intro-Card");

                                    var txt = 'Hello, I\'m QGH. Somehow my soul is trapped inside this sword...'; /* The text */
                                    var speed = 50; /* The speed/duration of the effect in milliseconds */
                                    await self.htmlControl.typeWriter(txt, speed, "Intro-CardText", "Intro-Card", "Intro-CardReminder");

                                    await sleep(1000);

                                    var txt = 'There is a planet over there, let\'s go there to explore more!'; /* The text */
                                    var speed = 50; /* The speed/duration of the effect in milliseconds */
                                    await self.htmlControl.typeWriter(txt, speed, "Intro-CardText", "Intro-Card", "Intro-CardReminder");

                                    self.htmlControl.displayByClassName("Intro-CardReminder");
                                }, null, ">");
            }
            else if (!this.state.localeCompare("AboutMe")) {

                // 1. Clean the Intro Card
                mainTimeline    .call(this.htmlControl.hidebyClassName("Intro"));

                // 2. Plan to start flying toward saturn
                mainTimeline    .to(sword.position, {duration: 0.5, x: 5}, "pointSaturn")
                                .to(sword.rotation, {duration: 0.5, x: -Math.PI / 2, y: Math.PI / 2}, "pointSaturn");

                // 3. Ajust Camera, and start flying (bg start effects
                mainTimeline    .to(this.camera.rotation, {duration: 0.5, y: -Math.PI / 2}, "adjustCamera")
                                .to(this.camera.position, {duration: 0.5, z: 0}, "adjustCamera")
                                .to(sword.position, {duration: 0.5, z: 3}, "adjustCamera");
                
                // 4. Intro About Me
                mainTimeline    .call(async function() {
                                    var lastDialogState = true; // force to wait for dialog completed

                                    self.htmlControl.displayByClassName("AboutMe-DialogContainer"); 

                                    var reminder = setInterval(function(){
                                        if (lastDialogState) {
                                            self.htmlControl.displayByClassName("AboutMe-DialogReminder");
                                        }
                                    }, 5000)

                                    // show dialogs in order
                                    async function* dialogsGenerator() {
                                        // dialog 0
                                        let txt0 = 'Hello, my name is Antonio Q.\n I\'m studying Computer Engineering at UBC (3rd Year)'; /* The text */
                                        let speed0 = 50; /* The speed/duration of the effect in milliseconds */
                                        lastDialogState = false;
                                        yield await self.htmlControl.typeWriter(txt0, speed0, "AboutMe-DialogText", "AboutMe-DialogContainer", "AboutMe-DialogReminder");  

                                        // dialog 1
                                        let txt1 = 'I know Full Stack, Software, FPGA Development and some Hardware skills'; /* The text */
                                        let speed1 = 50; /* The speed/duration of the effect in milliseconds */
                                        lastDialogState = false;
                                        yield await self.htmlControl.typeWriter(txt1, speed1, "AboutMe-DialogText", "AboutMe-DialogContainer", "AboutMe-DialogReminder");

                                        // dialog 2
                                        let txt2 = 'Currently, I\'m looking for all kind of Opportunities.\n I\'m also brainstorming interesting projects to work on!'; /* The text */
                                        let speed2 = 50; /* The speed/duration of the effect in milliseconds */
                                        lastDialogState = false;
                                        yield await self.htmlControl.typeWriter(txt2, speed2, "AboutMe-DialogText", "AboutMe-DialogContainer", "AboutMe-DialogReminder");

                                        // dialog 3
                                        let txt3 = 'It seems we are about to reach the planent, \n you will learn more about me there!'; /* The text */
                                        let speed3 = 50; /* The speed/duration of the effect in milliseconds */
                                        lastDialogState = false;
                                        clearInterval(reminder);
                                        yield await self.htmlControl.typeWriter(txt3, speed3, "AboutMe-DialogText", "AboutMe-DialogContainer", "AboutMe-DialogReminder");
                                        self.htmlControl.displayByClassName("AboutMe-StateSwitchReminder"); 
                                    }
                                    const dialogGen = dialogsGenerator();
                                    
                                    // dialog 0
                                    if (lastDialogState) {
                                        dialogGen.next().then((res) => lastDialogState = res.value);
                                    }

                                    document.getElementsByClassName("AboutMe-DialogContainer")[0].addEventListener("click", function() {
                                        if (lastDialogState) {
                                            dialogGen.next().then((res) => lastDialogState = res.value);
                                        }
                                    }, false);
                                }, null, ">");

                
            }
            else if (!this.state.localeCompare("Projects")) {

                // 1. bring the planet forward, and ajust the sword angles
                mainTimeline    .to(sword.position, {duration: 0.5, x: 0, y: 0, z: 0}, "adjustForLanding")
                                .to(this.camera.position, {duration: 0.5, z: 5 }, "adjustForLanding")
                                .to(this.camera.rotation, {duration: 0.5, y: 0}, "adjustForLanding")

                // 2. start landing
                mainTimeline    .to(sword.position, {duration: 0.5, x: 5}, "pointSaturn")
                                .to(sword.rotation, {duration: 0.5, x: -Math.PI / 2, y: Math.PI / 2}, "pointSaturn")
                                .to(sword.position, {duration: 1, x: 6, z: 6})
                                .to(sword.position, {duration: 0.5, x: -1000, z: -1000});

                // 3. maybe some landing animation and introducation
                mainTimeline    .call(this.htmlControl.displayByClassName, ["Projects"], "showProjects");

                // 4. view projects on the planet
            }

            // dynamically changed object position based window/canvas size
            window.addEventListener( 'resize', onWindowResize, false);
            function onWindowResize() {
                if (!self.state.localeCompare("Intro")) {
                    // mainTimeline.to(sword.position, {duration: 0.5, x: -window.innerWidth / window.innerHeight * 7, y: 0});
                }
            };
        })
    }   
}

class HTMLControl {
    constructor() {
        this.createSlider();
    }

    /*  */
    typeWriter(txt, speed, id, parentClass, reminderClass) {
        //  empty text
        document.getElementById(id).innerHTML = "";

        var reminder = document.getElementsByClassName(reminderClass)[0];
        if (reminder.style.opacity == 1) {
            reminder.style.visibility = "hide";
            reminder.style.opacity = 0;
        }

        var i = 0;
        var txt = txt; /* The text */
        var speed = speed; /* The speed/duration of the effect in milliseconds */

        document.getElementsByClassName(parentClass)[0].addEventListener("click", ()=> {
            speed /= 4;
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

    /* https://codepen.io/yudizsolutions/pen/wvzrPoj */
    createSlider() {
        $(".custom-carousel").owlCarousel({
            // autoWidth: true,
            loop: true,
            dots: false,
            center: true,
            items: 1
        });
        $(document).ready(function () {
            $(".custom-carousel .item").click(function () {
                $(".custom-carousel .item").not($(this)).removeClass("active");
                $(this).toggleClass("active");
            });
        });
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

        this.swordAnimation;

        // this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        // this.raycaster = new THREE.Raycaster();
        // this.mouse = new THREE.Vector2();
        // this.pointOfIntersection = new THREE.Vector3(0,0,0);
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
        
        var self = this;

        function animate() {
            self.swordAnimation = requestAnimationFrame(animate);
            self.renderer.render(self.scene, self.camera);
        }

        animate();

        return sword;
    }


}

  
window.addEventListener('load', main);

/*  */
function main() {  
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(125, window.innerWidth/window.innerHeight, 0.001, 2000);    
    // var camera = new THREE.OrthographicCamera(window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / 2, 1, 1000)
    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    var container = document.getElementById('bg');
    container.appendChild (renderer.domElement);

    var htmlControl = new HTMLControl();
    var swordCharacter = new SwordCharacter(scene, camera, renderer);
    var QGHAnimation = new Animation(scene, camera, renderer, htmlControl, swordCharacter);

    QGHAnimation.sceneControl();

    document.getElementsByClassName("htmlContent-Container")[0].addEventListener("scroll", function() {
        const top = (window.pageYOffset || this.scrollTop)  - (this.clientTop || 0);
        // console.log(top);
        // console.log(QGHAnimation.state);

        // -> "AboutMe"
        if (QGHAnimation.state.localeCompare("AboutMe") && top >= 200 && top <= 300) {
            QGHAnimation.state = "AboutMe";
            QGHAnimation.sceneControl();
            window.cancelAnimationFrame(QGHAnimation.coinFlipAnimation);
        }
        // -> "Projects"
        else if (QGHAnimation.state.localeCompare("Projects") && top > 300) {
            QGHAnimation.state = "Projects";
            QGHAnimation.sceneControl();
            window.cancelAnimationFrame(QGHAnimation.starAnimation);
        }
    });
}

/*  */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
