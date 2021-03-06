export default class LocalExporter {
    constructor(config, ondone, onProgress) {
        this.onProgress         = onProgress;
        this.fps                = Number(config.video.fps);
        this.videoBitrate       = config.video.bitrate;
        this.duration           = config.sound.duration;
        this.encodedVideoFrames = 0;
        this.width              = config.video.width;
        this.height             = config.video.height;
        this.sound              = config.sound;
        this.fileName           = config.fileName || "myVid.mp4";
        this.ondone             = ondone;
        this.animationManager   = config.animationManager;
        this.time               = 0;
        this.frames             = [];
        this.presetIdx          = config.video.presetIdx;
        this.gui                = config.gui.getRoot();
        this.canceled = false;

        if(config.useCustomTimeRange) {
            alert("Custom time range not supported on desktop client, using entire song duration")
        }

        this.presetLookup = [
            "ultrafast",
            "veryfast",
            "fast",
            "medium",
            "slow",
            "veryslow"
        ];

        if(window.__init) {
            window.__init({
                fps: this.fps,
                bitrate: this.videoBitrate,
                width: this.width,
                height: this.height,
                preset: this.presetLookup[this.presetIdx],
                sound: this.sound,
                name: this.fileName,
            });
        }else {
            alert("init not a ting");
        }
    }

    init = (cb) => {
        this.onready = cb;
        this.encoderInitialized();
    }

    prepare = () => {
        this.sound.setEncodeStartTime(0);
        this.animationManager.seekTime(0);
        this.time = 0;
    }

    encoderInitialized = () => {
        this.encoding = true;
        this.encodedVideoFrames = 0;
        this.startTime = performance.now()
        this.onready();
    }

    cancel = () => {
        this.canceled = true;
        window.__close();
    }

    encode = () => {
        if(!this.canceled ) {

            const audioData = this.sound.getAudioData(this.time);
            Object.keys(this.gui.__automations).forEach(key => {
                this.gui.__automations[key].update(this.time, audioData);
            });

            this.animationManager.update(this.time, audioData, true);
            this.time += 1 / this.fps;
            const sleepTime = this.encodeVideoFrame();
        
            if(this.encodedVideoFrames % 60 === 0) 
                this.onProgress(this.encodedVideoFrames, Math.floor(this.duration * this.fps))
    
            if(this.encodedVideoFrames >= Math.floor(this.duration * this.fps)) {
                if(window.__close) {
                    window.__encodeAudio(this.sound);
                    window.__close();
                    this.onProgress(1, 1);
                    this.ondone();
                    this.canceled = true;
                }else {
                    alert("window.__close ? ")
                }
            }

            setTimeout(this.encode, sleepTime);
        }
    }

    encodeVideoFrame = () => {
        this.encodedVideoFrames++;   
        
        if(window.__addImage) {
            const pixels = this.animationManager.readPixels();

            var width = this.animationManager.width;
            var height = this.animationManager.height;
           
            var halfHeight = height / 2 | 0;  // the | 0 keeps the result an int
            var bytesPerRow = width * 4;

            // make a temp buffer to hold one row
            var temp = new Uint8Array(width * 4);
            for (var y = 0; y < halfHeight; ++y) {
            var topOffset = y * bytesPerRow;
                var bottomOffset = (height - y - 1) * bytesPerRow;

                // make copy of a row on the top half
                temp.set(pixels.subarray(topOffset, topOffset + bytesPerRow));
                pixels.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
                pixels.set(temp, bottomOffset);
            }
            return window.__addImage(pixels, this.encodedVideoFrames);
        }else {
            alert("add video? :(")
        }

        return 0;
    }


    encodeAudioFrame = () => {
        const frame = this.sound.getEncodingFrame();
        if(window.__addAudio) {
            window.__addAudio(frame); 
        }else {
            //alert("add audio? :(")
        }
    }
}