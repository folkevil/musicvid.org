
import * as THREE from 'three';
import ShaderToyMaterial from 'editor/util/ShaderToyMaterial'
import fragShader from '../shaders/licensed/Noise'
import ImpactAnalyser from 'editor/audio/ImpactAnalyser'
import { loadImageTextureFromChoice } from 'editor/util/ImageLoader';
import addNoise from 'editor/util/AddNoise'

export default class NoiseMaterial extends ShaderToyMaterial {
    constructor(item) {
        super(
            fragShader,
            {
                uniforms: { 
                    iChannel0: {value: null, type: "t"},
                    iResolution: {value: new THREE.Vector2(item.width, item.height)},
                    iTime: {value: 0.0},
                    mult: {value: 4.0},
                    green: {value: .1},
                    red: {value: .2},
                    blue: {value: .4},
                    textureZoom: {value: 4}
                }
            }
        )

        this.name = "Noise Animation";
        this.texLoader = new THREE.TextureLoader(); 
        this.prevFile = "noisy2.png";
        loadImageTextureFromChoice("./img/noise/" + this.prevFile, this.setTexture);     
        
        this.time = 0;
        this.lastTime = 0;
        this.amplitude = 0.1;
        this.baseSpeed = 0.1;
        this.noises = [];
        this.width = item.width;
        this.height = item.height;


        this.red = 0.1;
        this.green = 0.2;
        this.blue = 0.4;

        //GUi
        this.textureZoom = 4;
        this.impactAnalyser = new ImpactAnalyser(this.folder);
        this.impactAnalyser.endBin = 60;
        this.impactAnalyser.deltaDecay = 20;
        
    
        item.__attribution = {
            showAttribution: true,
            name:"Noise animation - Electric",
            authors: [
                {
                    name: "nmz (@stormoid)", 
                    social1: {type: "website", url: "http://stormoid.com/"},
                    social2: {type: "twitter", url: "https://twitter.com/stormoid"},
                },
            ],
            projectUrl: "https://www.shadertoy.com/view/ldlXRS",
            description: "",
            license: item.LICENSE.REQUIRE_ATTRIBUTION,
            changeDisclaimer: true,
            imageUrl: "img/templates/Noise.png"
        }
    }

    __addUndoAction = (func, args) => {
        const item = {func: func, args: args, type: "action"};
        this.folder.getRoot().addUndoItem(item); 
    }
    

    setTexture = (tex) => {
        tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
        tex.repeat.set(50, 1);
        this.uniforms.iChannel0.value  =tex;
        this.needsUpdate = true;
    }

    undoUpdateTexture = (path) => {
        loadImageTextureFromChoice("./img/noise/" + path, this.setTexture);
    }

    updateTexture = (path, undoAction = false) => {
        loadImageTextureFromChoice("./img/noise/" + path, this.setTexture)
        this.__addUndoAction(this.undoUpdateTexture, this.prevFile);
        this.prevFile = path;
    }
    __setUpGUI = (folder) => {
        folder.add(this, "baseSpeed", -10, 10, 0.01);
        folder.add(this, "amplitude", -1, 1, 0.001);

        folder.add(this, "width").onChange(() => this.uniforms.iResolution.value = new THREE.Vector2(this.width, this.height))
        folder.add(this, "height").onChange(() => this.uniforms.iResolution.value = new THREE.Vector2(this.width, this.height))
        
        folder.add(this.uniforms.textureZoom, "value", 0, 40).name("Texture zoom");
        folder.add(this.uniforms.red, "value", 0, 1, 0.01).name("Red");
        folder.add(this.uniforms.green, "value", 0, 1, 0.01).name("Green");
        folder.add(this.uniforms.blue, "value", 0, 1, 0.01).name("Blue");
        addNoise(folder, this.updateTexture, "noisy2.png");
        this.folder = folder;
        return folder;
    }

    stop = () => {
        this.time = 0;
        this.lastTime = 0;
    }

    updateMaterial = (time, audioData) => {
        this.uniforms.iTime.value = time;
        if(this.impactAnalyser) {
            const impact = this.impactAnalyser.analyse(audioData.frequencyData) ;
            this.time += this.baseSpeed * 0.01 + (time  - this.lastTime) * impact * this.amplitude / 10; 
            this.uniforms.iTime.value = this.time ;
            this.lastTime = time;
        }
    }
}