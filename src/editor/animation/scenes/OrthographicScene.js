
import * as THREE from 'three';
import Scene from './Scene'

export default class Scene3DOrtho extends Scene {
    constructor(gui, resolution, remove, moveScene) {
        super(gui, resolution, remove, moveScene);
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.001, 10 );
        this.camera.position.z = 1;
        this.MODAL_REF_NR = 6;
        this.type = "ortho";
        if(this.folder) {
            this.folder.name = "webgl 2d scene";
            this.setUpControls();
        }    
    }
}