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
            <a id="structureBtn" href="#/kittydonoutshop"><button class="button">${promot}</button></a>
            `
        ));
    
        document.getElementById("structureBtn").addEventListener("click", function() {
            document.getElementById("page-view").style.zIndex = "20";
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
            `<div class="kittydonout-content">
                <div class="About-Me">
                    <img src="./clientV2/assets/images/kittyDonout.jpg" alt="Donout Cat">
                    <div class="About-Me-Content">
                        <h1>Hello I'm Antonio</h1>
                        <p>
                            Currently, I am a 3rd year Computer Engineering student at UBC
                        </p>
                        <p>
                            I love designing games, websites, applications that solve problems, ...
                        </p>
                        <div class="page-control">
                            <a href="#/"><button class="button">Return</button><a/>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
}

export class Contact {
    constructor() {
        this.elem = createDOM(
            `<div class="contact">
                <ul>
                    <li><a href="https://www.linkedin.com/in/antonio-qiao/" target="_blank"><i class="fa-brands fa-github" aria-hidden="true"></i></a></li>
                    <li><a href="https://github.com/QGH11" target="_blank"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a></li>
                    <li><a href="mailto:Guanhua.Qiao@outlook.com" target="_blank"><i class="fa-regular fa-envelope" aria-hidden="true"></i></a></li>
                    <li><a href="https://github.com/QGH11/QGH-Portfolio-Website/issues" target="_blank"><i class="fa-regular fa-lightbulb" aria-hidden="true"></i></a></li>
                    <li><a class="page-control" href="#/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></a></li>
                </ul>
            </div>`
        );
    }
}

export class Legal {
    constructor() {
        this.elem = createDOM(
            `<div class="legal">
                <h1>Future of This World </h1>
                <p> I would like to add more content and features to this world, 
                    but I would love to have other people and developers to work on this project together. <br>
                    I may add features so that people can edit and create features directly to the world, like MMORPG, Minecraft...
                </p>
                <ul> Here are some of my ideas
                    <li> 
                        <a>Make this world a shopping place: online web 3D supermarket...</a>
                    </li>   
                    <li> 
                        <a>Make this world a social area: online web 3D social media...</a>
                    </li>
                    <li> 
                        <a>Make this world a game: game </a>
                    </li>
                    <li> 
                        <a>Make this world a world: greedy me want all the features...</a>
                    </li>
                    <li> 
                        <a>Suggest More...</a>
                    </li>
                </ul>
                                
                <h1>Disclaimer on QGH Portfolio</h1>
                <p> Copyright © 2023 QGH Portfolio, All Rights Reserved <br> 
                    Projects under MIT liscense <br>
                    As I mentioned above, I do love to make this project a collaborative one (like linux), 
                    so feel free to contact the community via Github!
                </p>

                <h1>Credit</h1>
                <p> Thanks to all the amazing developers and artists that provide open resources, 
                    so that I can develop this project happily. <br>
                    More info on Github Readme
                </p>

                <div class="page-control">
                    <a href="#/"><button class="button">Return</button><a/>
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