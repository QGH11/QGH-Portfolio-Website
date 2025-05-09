import * as THREE from '../../../node_modules/three/build/three.module.js';
import Joystick from "./joystick.js"

// https://github.com/simondevyoutube/ThreeJS_Tutorial_CharacterController
class BasicCharacterControllerProxy {
    constructor(animations) {
      this._animations = animations;
    }
  
    get animations() {
      return this._animations;
    }
};
  
export default class BasicCharacterController {
    constructor(target, params) {
        this._target = target;
        this._Init(params);
    }
  
    _Init(params) {
        this._params = params;
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._position = new THREE.Vector3();
        this._canjump = true;
        this._collision = null;

        // boxhelper for collision
        // const boxHelper = new THREE.BoxHelper(this._target.children[0]);
        // this._target.add(boxHelper);
    
        this._animations = {};
        this._input = new BasicCharacterControllerInput();
        this._stateMachine = new CharacterFSM(new BasicCharacterControllerProxy(this._animations));
    }
    
    /* for camera  */
    get Position() {
        // ignore jumping camera movement
        return new THREE.Vector3(this._position.x, this._position.y, this._position.z);
    }
    
    /* for camera  */
    get Rotation() {
        if (!this._target) {
            return new THREE.Quaternion();
        }
        return new THREE.Quaternion(this._target.quaternion.x, this._target.quaternion.y, -this._target.quaternion.z, this._target.quaternion.w);
    }
    
    /* handle collision */
    collisionHandler(collision) {
        this._collision = collision;
    }

    Update(timeInSeconds) {
        if (!this._target) {
            return;
        }

        this._stateMachine.Update(timeInSeconds, this._input);
    
        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.multiplyScalar(timeInSeconds);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));
    
        velocity.add(frameDecceleration);
    
        const controlObject = this._target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();
    
        const acc = this._acceleration.clone();
        if (this._input._keys.shift) {
            acc.multiplyScalar(2.0);
        }
    
        // if (this._stateMachine._currentState.Name == 'dance') {
        // acc.multiplyScalar(0.0);
        // }

        // jumping logic: no clue why z is changing
        if (this._input._keys.space && this._canjump) {
            velocity.y += 200 * timeInSeconds;
        }
        if (this._target.position.y >= 10) {
            this._canjump = false;
        }
        if(!this._canjump){
            velocity.y -= 150 * timeInSeconds;
            if(this._target.position.y <= 5) {
                this._canjump = true;
                velocity.y = 0;
            }
        }
        
        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        // key control 
        if (this._input._keys.forward) {
            // prevent collision
            if (this._collision != null) {
                if (oldPosition.x > this._collision.min.x && oldPosition.x < this._collision.max.x && oldPosition.z > this._collision.min.z && oldPosition.z < this._collision.max.z) {
                    velocity.z -= 200 * timeInSeconds;
                } else {
                    velocity.z += acc.z * timeInSeconds
                }
            }   
            else {
                velocity.z += acc.z * timeInSeconds;
            }
        }
        if (this._input._keys.backward) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this._input._keys.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this._input._keys.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
    
        controlObject.quaternion.copy(_R);
    
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();
    
        const sideways = new THREE.Vector3(0, 1, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();
    
        sideways.multiplyScalar(velocity.y * timeInSeconds);
        forward.multiplyScalar(velocity.z * timeInSeconds);


        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        this._position.copy(controlObject.position);
    
        if (this._mixer) {
            this._mixer.update(timeInSeconds);
        }
    }
  };
  
class BasicCharacterControllerInput {
    constructor() {
        this._Init();    
    }

    _Init() {
        this._keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            space: false,
            shift: false
        };

        this._joystick = null;

        if (detectMob()) { //movile control
            this._joystick = new Joystick();
            var self = this;
            document.addEventListener('touchmove', function() {
                if (self._joystick.dragStart != null) {
                    var coordinate = self._joystick.joystick.getPosition();
                    var theta = Math.atan2(coordinate.y, coordinate.x); // range (-PI, PI]
                    theta *= 180 / Math.PI;
                    
                    if (theta > -22.5 && theta <= 22.5) {
                        // D
                        self._keys = {
                            forward: false,
                            backward: false,
                            left: false,
                            right: true,
                        }
                    }
                    else if (theta > 22.5 && theta <= 67.5) {
                        // DS
                        self._keys = {
                            forward: false,
                            backward: true,
                            left: false,
                            right: true,
                        }
                    }
                    else if (theta > 67.5 && theta <= 112.5) {
                        // S
                        self._keys = {
                            forward: false,
                            backward: true,
                            left: false,
                            right: false,
                        }
                    }
                    else if (theta > 112.5 && theta <= 157.5) {
                        // SA
                        self._keys = {
                            forward: false,
                            backward: true,
                            left: true,
                            right: false,
                        }
                    }
                    else if ((theta > 157.5 && theta <= 180) || (theta > -180 && theta <= -157.5)) {
                        // A
                        self._keys = {
                            forward: false,
                            backward: false,
                            left: true,
                            right: false,
                        }
                    }
                    else if (theta > -157.5 && theta <-112.5) {
                        // AW
                        self._keys = {
                            forward: true,
                            backward: false,
                            left: true,
                            right: false,
                        }
                    }
                    else if (theta > -112.5 && theta <-67.5) {
                        // W
                        self._keys = {
                            forward: true,
                            backward: false,
                            left: false,
                            right: false,
                        }
                    }
                    else if (theta > -67.5 && theta <-22.5) {
                        // WD
                        self._keys = {
                            forward: true,
                            backward: false,
                            left: false,
                            right: true,
                        }
                    }
                }
            }, false);
            document.addEventListener('touchend', function() {
                self._keys = {
                    forward: false,
                    backward: false,
                    left: false,
                    right: false,
                    space: false,
                    shift: false
                }
            }, false);
        }
        else { // PC Controls
            document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
            document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
        }

        function detectMob() {
            const toMatch = [
                /Android/i,
                /webOS/i,
                /iPhone/i,
                /iPad/i,
                /iPod/i,
                /BlackBerry/i,
                /Windows Phone/i
            ];
            
            return toMatch.some((toMatchItem) => {
                return navigator.userAgent.match(toMatchItem);
            });
        }
    }

    

    _onKeyDown(event) {
        switch (event.keyCode) {
        case 87: // w
            this._keys.forward = true;
            break;
        case 65: // a
            this._keys.left = true;
            break;
        case 83: // s
            this._keys.backward = true;
            break;
        case 68: // d
            this._keys.right = true;
            break;
        case 38: // uparrow
            this._keys.forward = true;
            break;
        case 37: // leftarrow
            this._keys.left = true;
            break;
        case 40: // downarrow
            this._keys.backward = true;
            break;
        case 39: // righarrow
            this._keys.right = true;
            break;
        case 32: // SPACE 
            this._keys.space = true;
            break;
        case 16: // SHIFT
            this._keys.shift = true;
            break;
        }
    }

    _onKeyUp(event) {
        switch(event.keyCode) {
        case 87: // w
            this._keys.forward = false;
            break;
        case 65: // a
            this._keys.left = false;
            break;
        case 83: // s
            this._keys.backward = false;
            break;
        case 68: // d
            this._keys.right = false;
            break;
        case 38: // uparrow
            this._keys.forward = false;
            break;
        case 37: // leftarrow
            this._keys.left = false;
            break;
        case 40: // downarrow
            this._keys.backward = false;
            break;
        case 39: // righarrow
            this._keys.right = false;
            break;
        case 32: // SPACE
            this._keys.space = false;
            break;
        case 16: // SHIFT
            this._keys.shift = false;
            break;
        }
    }
};


class FiniteStateMachine {
    constructor() {
        this._states = {};
        this._currentState = null;
    }

    _AddState(name, type) {
        this._states[name] = type;
    }

    SetState(name) {
        const prevState = this._currentState;
        
        if (prevState) {
        if (prevState.Name == name) {
            return;
        }
        prevState.Exit();
        }

        const state = new this._states[name](this);

        this._currentState = state;
        state.Enter(prevState);
    }

    Update(timeElapsed, input) {
        if (this._currentState) {
            this._currentState.Update(timeElapsed, input);
        }
    }
};


class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
        super();
        this._proxy = proxy;
        this._Init();
    }

    _Init() {
        this._AddState('idle', IdleState);
        this._AddState('walk', WalkState);
        this._AddState('run', RunState);
        this._AddState('jump', JumpState);
    }
}; 
  
class State {
    constructor(parent) {
        this._parent = parent;
    }

    Enter() {}
    Exit() {}
    Update() {}
};

// class DanceState extends State {
//     constructor(parent) {
//       super(parent);
  
//       this._FinishedCallback = () => {
//         this._Finished();
//       }
//     }
  
//     get Name() {
//       return 'dance';
//     }
  
//     Enter(prevState) {
//       const curAction = this._parent._proxy._animations['dance'].action;
//       const mixer = curAction.getMixer();
//       mixer.addEventListener('finished', this._FinishedCallback);
  
//       if (prevState) {
//         const prevAction = this._parent._proxy._animations[prevState.Name].action;
  
//         curAction.reset();  
//         curAction.setLoop(THREE.LoopOnce, 1);
//         curAction.clampWhenFinished = true;
//         curAction.crossFadeFrom(prevAction, 0.2, true);
//         curAction.play();
//       } else {
//         curAction.play();
//       }
//     }
  
//     _Finished() {
//       this._Cleanup();
//       this._parent.SetState('idle');
//     }
  
//     _Cleanup() {
//       const action = this._parent._proxy._animations['dance'].action;
      
//       action.getMixer().removeEventListener('finished', this._CleanupCallback);
//     }
  
//     Exit() {
//       this._Cleanup();
//     }
  
//     Update(_) {
//     }
// };

class JumpState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'jump';
    }

    Enter(prevState) {
        // const curAction = this._parent._proxy._animations['jump'].action;
        // if (prevState) {
        //     const prevAction = this._parent._proxy._animations[prevState.Name].action;

        //     curAction.enabled = true;

        //     if (prevState.Name == 'run') {
        //         const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        //         curAction.time = prevAction.time * ratio;
        //     } else {
        //         curAction.time = 0.0;
        //         curAction.setEffectiveTimeScale(1.0);
        //         curAction.setEffectiveWeight(1.0);
        //     }

        //     curAction.crossFadeFrom(prevAction, 0.5, true);
        //     curAction.play();
        // } else {
        //     curAction.play();
        // }
    }

    Exit() {
    }

    Update() {
        // this._parent.SetState('idle');
    }
};
  
class WalkState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'walk';
    }

    Enter(prevState) {
        // const curAction = this._parent._proxy._animations['walk'].action;
        // if (prevState) {
        //     const prevAction = this._parent._proxy._animations[prevState.Name].action;

        //     curAction.enabled = true;

        //     if (prevState.Name == 'run') {
        //         const ratio = curAction.getClip().duration / prevAction.getClip().duration;
        //         curAction.time = prevAction.time * ratio;
        //     } else {
        //         curAction.time = 0.0;
        //         curAction.setEffectiveTimeScale(1.0);
        //         curAction.setEffectiveWeight(1.0);
        //     }

        //     curAction.crossFadeFrom(prevAction, 0.5, true);
        //     curAction.play();
        // } else {
        //     curAction.play();
        // }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input._keys.forward || input._keys.backward) {
            if (input._keys.shift) {
                this._parent.SetState('run');
            }
            return;
        }

        this._parent.SetState('idle');
    }
};

class RunState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'run';
    }

    Enter(prevState) {
        const curAction = this._parent._proxy._animations['run'].action;
        if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;

        curAction.enabled = true;

        if (prevState.Name == 'walk') {
            const ratio = curAction.getClip().duration / prevAction.getClip().duration;
            curAction.time = prevAction.time * ratio;
        } else {
            curAction.time = 0.0;
            curAction.setEffectiveTimeScale(1.0);
            curAction.setEffectiveWeight(1.0);
        }

        curAction.crossFadeFrom(prevAction, 0.5, true);
        curAction.play();
        } else {
        curAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input._keys.forward || input._keys.backward) {
        if (!input._keys.shift) {
            this._parent.SetState('walk');
        }
        return;
        }

        this._parent.SetState('idle');
    }
};
  
class IdleState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'idle';
    }

    Enter(prevState) {
        const idleAction = this._parent._proxy._animations['idle'].action;
        if (prevState) {
        const prevAction = this._parent._proxy._animations[prevState.Name].action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0);
        idleAction.setEffectiveWeight(1.0);
        idleAction.crossFadeFrom(prevAction, 0.5, true);
        idleAction.play();
        } else {
        idleAction.play();
        }
    }

    Exit() {
    }

    Update(_, input) {
        if (input._keys.forward || input._keys.backward) {
        this._parent.SetState('walk');
        } else if (input._keys.space) {
        this._parent.SetState('jump');
        }
    }
};

export class ThirdPersonCamera {
    constructor(params) {
        this._params = params;
        this._camera = params.camera;

        this._currentPosition = new THREE.Vector3();
        this._currentLookat = new THREE.Vector3();

        this._pauseCameraFollow = false;

        var self = this;    
        this._params.orbitControl.addEventListener('start', function() {
            self._pauseCameraFollow = true;
        });
        this._params.orbitControl.addEventListener('end', function() {
            self._pauseCameraFollow = false;
        });

        this._joystick_dragstart = null;

        this._scroll = 35; // max=370, min=-30
        this._lookAt = 0;

        document.addEventListener("wheel", function(e) {
            // adjust the camera based on scroll
            if (e.deltaY < 0) {
                // scroll up
                if (self._scroll >= 10) {
                    self._scroll -= 5;

                    if (self._scroll >= 80) {
                        self._lookAt -= 15;
                    }
                    else {
                        self._lookAt = 0;
                    }
                }
            }
            else if (e.deltaY > 0) {
                // scroll down
                if (self._scroll <= 225) {
                    self._scroll += 5;

                    if (self._scroll >= 80) {
                        self._lookAt += 15;
                    }
                    else {
                        self._lookAt = 0;
                    }
                }
            }

            // show the project screen
            if (self._scroll >= 120 && self._scroll <= 130) {
                document.getElementById("projects-wrapper").style.opacity = 1;
                document.getElementById("projects-wrapper").style.zIndex = 15;
                document.getElementById("projects-wrapper").className = "on";
            }
            else {
                document.getElementById("projects-wrapper").style.opacity= 0;
                document.getElementById("projects-wrapper").style.zIndex = 5;
                document.getElementById("projects-wrapper").className = "off";
            }
        }, true);


        
        this.touchPos = 0;

        document.addEventListener('touchstart', function(e) {    
            self.touchPos = e.changedTouches[0].clientY;
        });
        document.addEventListener("touchmove", function(e){
            if (self._joystick_dragstart == null) {
                
                // detect wether the "old" touchPos is 
                // greater or smaller than the newTouchPos
                var newTouchPos = e.changedTouches[0].clientY;
                if(newTouchPos > self.touchPos) {
                    //finger moving down
                    if (self._scroll >= 10) {
                        self._scroll -= Math.abs(self.touchPos - newTouchPos) / 150;

                        if (self._scroll >= 80) {
                            self._lookAt -= Math.abs(self.touchPos - newTouchPos) / 50;
                        }
                        else {
                            self._lookAt = 0;
                        }
                    }
                }
                else if(newTouchPos < self.touchPos) {
                    // finger moving up
                    if (self._scroll <= 225) {
                        self._scroll += Math.abs(self.touchPos - newTouchPos) / 150;

                        if (self._scroll >= 80) {
                            self._lookAt += Math.abs(self.touchPos - newTouchPos) / 50;
                        }
                        else {
                            self._lookAt = 0;
                        }
                    }
                }
                
                // console.log(self._scroll)
                // show the project screen
                if (self._scroll >= 120 && self._scroll <= 130) {
                    document.getElementById("projects-wrapper").style.opacity = 1;
                    document.getElementById("projects-wrapper").style.zIndex = 15;
                    document.getElementById("projects-wrapper").className = "on";
                }
                else {
                    document.getElementById("projects-wrapper").style.opacity= 0;
                    document.getElementById("projects-wrapper").style.zIndex = 5;
                    document.getElementById("projects-wrapper").className = "off";
                }
                
            }
        });
    }
  
    _CalculateIdealOffset() {
        const idealOffset = new THREE.Vector3(0, this._scroll, -this._scroll);
        idealOffset.applyQuaternion(this._params.target.Rotation);   
        idealOffset.add(this._params.target.Position);
        return idealOffset;
    }
  
    _CalculateIdealLookat() {
        const idealLookat = new THREE.Vector3(0, 0 + this._lookAt, 0);
        idealLookat.applyQuaternion(this._params.target.Rotation);
        idealLookat.add(this._params.target.Position);
        return idealLookat;
    }
  
    Update(timeElapsed, joystick) {
        this._joystick_dragstart = joystick == null ? null : joystick.dragStart;
        
        if (!this._pauseCameraFollow) {
            const idealOffset = this._CalculateIdealOffset();
            const idealLookat = this._CalculateIdealLookat();

            // const t = 0.05;
            // const t = 4.0 * timeElapsed;
            const t = 1.0 - Math.pow(0.001, timeElapsed);

            this._currentPosition.lerp(idealOffset, t);
            this._currentLookat.lerp(idealLookat, t);   

            this._camera.position.copy(this._currentPosition);
            this._camera.lookAt(this._currentLookat)
        }
        else {
            this._params.orbitControl.target.set(this._params.target.Position.x, this._params.target.Position.y + this._scroll, this._params.target.Position.z - this._scroll)
        }
    }
} 