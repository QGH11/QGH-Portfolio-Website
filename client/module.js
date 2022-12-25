import * as THREE from 'three';

const scene = new THREE.Scene();

// revolutions per second
// var angularSpeed = 0.2; 
// var lastTime = 0;
// var g = 9.8;
  
// var V0 =  100 ;
// var t = 0;
// // this function is executed on each animation frame
// function animate()
// {
  
//   // update
//   var time = (new Date()).getTime();
//   var timeDiff = time - lastTime;
//   var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 100;
  
//   lastTime = time;

//   if(cylinder.position.y >= 0)
//   {    
//     cylinder.rotation.x += angleChange;
//     cylinder.position.y = V0 * t - (g * t * t / 2);
  
//     t+=0.2;
//   }

//   // render
//   renderer.render(scene, camera);

//   // request new frame
//   requestAnimationFrame(function(){
//       animate();
//   });
// }

// // renderer
// var renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // camera
// var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
// camera.position.z = 1500;

// // scene
// var scene = new THREE.Scene();
          
// // cylinder
// // API: THREE.CylinderGeometry(bottomRadius, topRadius, height, segmentsRadius, segmentsHeight)
// var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(100, 100, 5, 50, 50, false), new THREE.MeshNormalMaterial());
// cylinder.overdraw = true;
// scene.add(cylinder);

// // start animation
// animate();