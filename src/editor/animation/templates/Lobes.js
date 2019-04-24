

import WebGLManager from '../WebGLManager'

export default class Manager extends WebGLManager {

    setUpScene() {
        this.scenes.push(this.addSceneFromText("ortho"));
        this.scenes[0].addItemFromText("SideLobes");        
    }
}