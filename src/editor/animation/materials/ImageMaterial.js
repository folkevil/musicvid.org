import * as THREE from 'three';
import { loadImageTexture, loadImageTextureFromChoice } from 'editor/animation/util/ImageLoader';
import ImpactAnalyser from '../audio/ImpactAnalyser'
import getRandomImage from './GetRandomImage'

import serialize from '../Serialize'
const vertexShader = [
    "varying vec2 vUv;",
    "void main() {",
        "vUv = uv;",
        "gl_Position =   projectionMatrix * modelViewMatrix * vec4(position,1.0);",
    "}",
].join("\n");

const fragmentShader = [
    "uniform sampler2D texture1;",
    "uniform bool enablePostProcessing;",
    "uniform bool should_mirror_left_half;",
    "uniform bool should_mirror_right_half;",
    "uniform bool should_mirror_whole;",
    "uniform float matScale;",
    "uniform float matScaleX;",
    "uniform float matScaleY;",

    "uniform float vignette_amt;",
    "uniform float opacity;",
    "uniform float img_aspect;",
    "uniform float canvas_aspect;",
    "uniform bool should_resize;",
    "uniform bool should_blackbox;",

    "varying vec2 vUv;",

    "void main() {",
        "vec2 pos  = vUv;",
        "if(should_mirror_whole) {",
            "if(pos.x < 0.5) {",
                "pos.x = pos.x * 2.;",
            "}else {",
                "pos.x =  1. - (pos.x -0.5) * 2.;",
            "}",
        "}else if(should_mirror_left_half) {",
            "if(pos.x > 0.5){",
                "pos.x = 1.0 - pos.x;",
            "}",
        "}",
        "else if(should_mirror_right_half) {",
            "if(pos.x < 0.5){",
                "pos.x = 1.0 - pos.x;",
            "}",
        "}",
        "float b = (1. / img_aspect) * canvas_aspect;",
        "float offset = 0.;",
        "if(should_resize) {",
            "float s = canvas_aspect / img_aspect;",
            "if(s > 1.0) { ",
                "offset = (s - 1.0) / 2.0;",
                "pos.y = (pos.y + offset) / s;",
            "}else {",
                "s=1./s;",
                "offset = (s - 1.0) / 2.0;",
                "pos.x = (pos.x + offset) / s;",
            "}",


            //"pos.y = pos.y*b - offset;",
        "}",

        "pos*=matScale;",
        "pos.x*=matScaleX;",
        "pos.y*=matScaleY;",

        "float vig_amt = 0.0;",
        "if(enablePostProcessing)",
            "vig_amt = vignette_amt * length(vec2(0.5, 0.5) - vUv);",

        
        "gl_FragColor = texture2D(texture1, pos) - vig_amt;",
        "gl_FragColor.a = opacity;",
        "if(should_resize && should_blackbox && (vUv.y < offset || vUv.y > 1. - offset))",
            "gl_FragColor = vec4(0.,0.,0.,0.);",
    "}"
].join("\n");



export default class ImageMaterial extends THREE.ShaderMaterial{
    constructor(item) {
        super()
        
        this.brightenToAudio = true;
        this.brightenMultipler = 1;
        this.vignetteAmount = 0.3;

        this.wrapLookup = {
            mirror: THREE.MirroredRepeatWrapping,
            clamp: THREE.ClampToEdgeWrapping,
            repeat: THREE.RepeatWrapping
        }

        this.wrapS = "clamp";
        this.wrapT = "clamp";
        this.mirror = "left half";

        this.uniforms = { 
            texture1: {type: "t", value: null }, 
            vignette_amt: {value: 0.42}, 
            enablePostProcessing: {value: true}, 
            should_mirror_left_half: {value: true},
            should_mirror_right_half: {value: true},

            should_mirror_whole: {value: false},
            matScale: {value: 1.0},
            matScaleX: {value: 1.0},
            matScaleY: {value: 1.0},
            opacity: {value: 1.0},
            should_resize: {value: true},
            canvas_aspect: {value: item.width / item.height},
            img_aspect: {value: item.width / item.height},
            should_blackbox: {value: false}
        }
        this.transparent = true;
        this.vertexShader = vertexShader; 
        this.fragmentShader = fragmentShader;
        const url = getRandomImage();
        this.prevFile = url;
        this._opacity = 1.0;
        loadImageTextureFromChoice(url, this.setBackground);  

        this.path = "material";
        this.__item = item;
    }

    updateMaterial = (time, dt, audioData) => {
        if(this.impactAnalyser) {
            const impact = this.impactAnalyser.analyse(audioData.frequencyData) ;
            this.uniforms.vignette_amt.value = this.vignetteAmount + impact * -this.brightenMultipler;
        }
    }

    dispose = () => {
        super.dispose();
        this.uniforms.texture1.value.dispose();
    }


    changeImage = () => {
        loadImageTexture(this, "setBackground");
    }

    setClamping = () => {
        const texture = this.uniforms.texture1.value;        
        if(texture) {
            texture.wrapS = this.wrapLookup[this.wrapS];
            texture.wrapT = this.wrapLookup[this.wrapT];
            texture.needsUpdate = true;
        } 
    }

    setBackground = (texture) => {
        this.imgController.setFileInfo({func: "setBackground", expectedType: "texture"});
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipMaps = false;
        this.uniforms.texture1.value = texture;
        this.needsUpdate = true;
        this.width = texture.image.width;
        this.height = texture.image.height;
        this.uniforms.img_aspect.value = this.width / this.height;
        this.__item.onImageChange(texture.image);
        this.setClamping();
    }

    setMirror = ()=> {
        this.uniforms.should_mirror_left_half.value = this.mirror === "left half";
        this.uniforms.should_mirror_right_half.value = this.mirror === "right half";

        this.uniforms.should_mirror_whole.value = this.mirror === "whole";
    }

    __serialize = () => {
        return serialize(this);
    }
    
    __setUpGUI = (folder) => {
        const i = this.__item;
        i.addController(folder, this, "wireframe");
        this.imgController = i.addController(folder, this, "changeImage");
        i.addController(folder, this, "wrapS", {values: ["repeat", "mirror", "clamp"]}).onChange(this.setClamping);
        i.addController(folder, this, "wrapT", {values: ["repeat", "mirror", "clamp"]}).onChange(this.setClamping);
        i.addController(folder, this.uniforms.enablePostProcessing, "value").name("Enable Postprocessing");
        i.addController(folder,this.uniforms.should_resize, "value", {path: "material-resize"}).name("Autoscale image");
        i.addController(folder,this.uniforms.should_blackbox, "value", {path: "material-bbox"}).name("Black box edges");
        i.addController(folder,this.uniforms.matScale, "value", {path: "material-scale", min: 0}).name("Scale");
        i.addController(folder,this.uniforms.matScaleX, "value", {path: "material-scaleX", min: 0}).name("Scale X");
        i.addController(folder,this.uniforms.matScaleY, "value", {path: "material-scaleY", min: 0}).name("Scale Y");
        i.addController(folder,this, "brightenToAudio");
        i.addController(folder,this, "brightenMultipler");     
        i.addController(folder,this, "_opacity", {path: "material-opac", min: 0, max: 1.0}).name("Opacity").onChange(() => this.uniforms.opacity.value = this._opacity);
        i.addController(folder,this, "vignetteAmount").onChange(() => this.uniforms.vignette_amt.value = this.vignetteAmount);
        i.addController(folder,this, "mirror", {path: "material-mirror", values: ["whole", "left half", "right half", "none"]}).name("Mirror").onChange(this.setMirror);
        this.impactAnalyser = new ImpactAnalyser(folder, i);
        this.impactAnalyser.endBin = 60;
        this.impactAnalyser.deltaDecay = 20;
        this.impactAnalyser.amplitude = 1;
        this.folder = folder;
        return folder;
    }
}