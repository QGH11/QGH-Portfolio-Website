import * as THREE from '../../../node_modules/three/build/three.module.js';

export default class Structure {
    constructor(structureScene) {
        this.structureScene = structureScene;

    }

    collisionHandler(collisionid) {
        switch(collisionid) {
            case 0: // kitty donut shop
                const promot = "Enter Kitty Donout Shop";
                enterStrucutre(promot);
                break;

            case -1: // leave strucutre
                break;
        }
    }

    enterStructure(promot) {
    
    }

    init(position, scale, rotationY) {
        this.structureScene.position.set(position.x, position.y, position.z);
        this.structureScene.scale.set(scale[0], scale[1], scale[2]);
        this.structureScene.rotateY(rotationY);

        const axesHelper = new THREE.AxesHelper( 10 );
        this.structureScene.add(axesHelper);

        const boxHelper = new THREE.BoxHelper(this.structureScene.children[0]);
        this.structureScene.add(boxHelper)
    }
}