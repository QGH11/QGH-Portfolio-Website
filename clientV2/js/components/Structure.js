import * as THREE from '../../../node_modules/three/build/three.module.js';

export default class Structure {
    constructor(structureScene) {
        this.structureScene = structureScene;
        this.structureInfo = document.getElementsByClassName("structure-info")[0];
    }

    collisionHandler(collisionid) {
        switch(collisionid) {
            case 0: // kitty donut shop
                const promot = "Enter Kitty Donout Shop";
                // console.log(this.structureInfo.childNodes.length)
                if (this.structureInfo.childNodes.length == 0) {
                    this.enterStructure(promot);
                }
                break;

            case -1: // leave strucutre
                emptyDOM(this.structureInfo);
                break;
        }
    }

    enterStructure(promot) {
        this.structureInfo.appendChild(createDOM(
            `
            <a id="structureBtn" href="#/kittydonoutshop"><button  class="button">${promot}</button></a>
            `
        ));
    
        document.getElementById("structureBtn").addEventListener("click", function() {
            document.getElementById("page-view").style.zIndex = "20"
        });
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

export class KittyDonoutShop {
    constructor() {
        this.elem = createDOM(
            `<div class = "content">
                <div class="About-Me">
                    <img src="./clientV2/assets/3DObjects/kitty_donout_shop/textures/texture_baseColor.png" alt="Donout Cat">
                
                </div>
                <div class = "page-control">
                <a href="#/"><button>Return</button><a/>
                </div>
            </div>`
        );
    }
}

// Removes the contents of the given DOM element (equivalent to elem.innerHTML = '' but faster)
function emptyDOM (elem){
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// Creates a DOM element from the given HTML string
function createDOM (htmlString){
    let template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}