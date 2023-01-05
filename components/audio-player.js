{
    class AudioPlayer extends HTMLElement {
        playing = false;
        volume = 0.4;
        prevVolume = 0.4;
        initialized = false;
        barWidth = 3;
        barGap = 1;
        bufferPercentage = 75;
        nonAudioAttributes = new Set(['title', 'bar-width', 'bar-gap', 'buffer-percentage']);
        
        constructor() {
        super();
        
        this.attachShadow({mode: 'open'});
        this.render();
        }
        
        static get observedAttributes() {
        return [
            // audio tag attributes
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
            'src', 'muted', 'crossorigin', 'loop', 'preload', 'autoplay',
            // the name of the audio
            'title',
            // the size of the frequency bar
            'bar-width',
            // the size of the gap between the bars
            'bar-gap',
            // the percentage of the frequency buffer data to represent
            // if the dataArray contains 1024 data points only a percentage of data will
            // be used to draw on the canvas
            'buffer-percentage'
        ];
        }
        
        async attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'src':
            this.initialized = false;
            this.render();
            this.initializeAudio();
            break;
            case 'muted':
            this.toggleMute(Boolean(this.audio?.getAttribute('muted')));
            break;
            case 'bar-width':
            this.barWidth = Number(newValue) || 3;
            break;
            case 'bar-gap':
            this.barGap = Number(newValue) || 1;
            break;
            case 'buffer-percentage':
            this.bufferPercentage = Number(newValue) || 75;
            break;
            default:
        }
        
        this.updateAudioAttributes(name, newValue);
        }
        
        updateAudioAttributes(name, value) {
        if (!this.audio || this.nonAudioAttributes.has(name)) return;
        
        // if the attribute was explicitly set on the audio-player tag
        // set it otherwise remove it
        if (this.attributes.getNamedItem(name)) {
            this.audio.setAttribute(name, value ?? '')
        } else {
            this.audio.removeAttribute(name);
        }
        }
        
        initializeAudio() {
        if (this.initialized) return;
        
        this.initialized = true;
        
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();
        this.analyserNode = this.audioCtx.createAnalyser();
        this.track = this.audioCtx.createMediaElementSource(this.audio);
        
        this.analyserNode.fftSize = 2048;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.analyserNode.getByteFrequencyData(this.dataArray);
        
        this.track
            .connect(this.gainNode)
            .connect(this.analyserNode)
            .connect(this.audioCtx.destination);
        }
        
        updateFrequency() {
        if (!this.playing) return;
        
        this.analyserNode.getByteFrequencyData(this.dataArray);
        
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.canvasCtx.fillStyle = "rgba(0, 0, 0, 0)";
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barCount = (this.canvas.width / (this.barWidth + this.barGap)) - this.barGap;
        const bufferSize = (this.bufferLength * this.bufferPercentage) / 100;
        let x = 0;
        
        // this is a loss representation of the frequency
        // some data are loss to fit the size of the canvas
        for (let i = 0; i < barCount; i++) {
            // get percentage of i value
            const iPerc = Math.round((i * 100) / barCount);
            // what the i percentage maps to in the frequency data
            const pos = Math.round((bufferSize * iPerc) / 100);
            const frequency = this.dataArray[pos];
            // frequency value in percentage
            const frequencyPerc = (frequency * 100) / 255;
            // frequency percentage value in pixel in relation to the canvas height
            const barHeight = (frequencyPerc * this.canvas.height) / 100;
            // flip the height so the bar is drawn from the bottom
            const y = this.canvas.height - barHeight;
            
            this.canvasCtx.fillStyle = `rgba(${frequency}, 255, 100)`;
            this.canvasCtx.fillRect(x, y, this.barWidth, barHeight);
            
            x += (this.barWidth + this.barGap);
        }
        
        requestAnimationFrame(this.updateFrequency.bind(this))
        }
        
        attachEvents() {
        this.playPauseBtn.addEventListener('click', this.togglePlay.bind(this), false);
        
        this.audio.addEventListener("loadedmetadata", () => {
            this.duration = this.audio.duration;

            const secs = parseInt(`${this.duration % 60}`, 10);
            const mins = parseInt(`${(this.duration / 60) % 60}`, 10);

            // console.log("duration", mins + secs);
            // console.log("duration", this.audio.duration);
            // console.log("currentTime", this.audio.currentTime);
        })
        
        this.audio.addEventListener('error', (e) => {
            this.playPauseBtn.disabled = true;
        })
        
        this.audio.addEventListener('timeupdate', () => {
            this.updateAudioTime(this.audio.currentTime);
        })
        
        this.audio.addEventListener('ended', () => {
            this.playing = false;
            this.playPauseBtn.firstChild.src = "assets/icons/play-button.png";
            this.playPauseBtn.classList.remove('playing');
        }, false);
        
        this.audio.addEventListener('pause', () => {
            this.playing = false;
            this.playPauseBtn.firstChild.src = "assets/icons/play-button.png";
            this.playPauseBtn.classList.remove('playing');
        }, false);
        
        this.audio.addEventListener('play', () => {
            this.playing = true;
            // this.playPauseBtn.textContent = 'pause';
            this.playPauseBtn.firstChild.src = "assets/icons/pause.png";
            this.playPauseBtn.classList.add('playing');
            this.updateFrequency();
        }, false);
        }
        
        async togglePlay() {
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
        
        if (this.playing) {
            return this.audio.pause();
        }
        
        return this.audio.play();
        }
        
        getTimeString(time) {
        const secs = `${parseInt(`${time % 60}`, 10)}`.padStart(2, '0');
        const min = parseInt(`${(time / 60) % 60}`, 10);

        return `${min}:${secs}`;
        }
        
        changeVolume(value) {
        this.volume = value;
        this.gainNode.gain.value = this.volume;
        }
        
        toggleMute(muted = null) {
        this.volumeBar.value = muted || this.volume === 0 ? this.prevVolume : 0;
        this.changeVolume();
        }
        
        seekTo(value) {
        this.audio.currentTime = value;
        }
        
        updateAudioTime(time) {
            this.currentTime = time;
            // console.log(this.currentTime);
        }
      
        style() {
            return `
            <style>
                .audio-player {
                    width: 100%;
                    display:flex;
                    flex-direction: row;
                    align-items: center;
                }
                
                .play-btn {
                    display: flex;
                    aligh-items: center;
                    background-color: #fff;  
                    border:none;
                }
                
                .play-btn.playing {
                    display: flex;
                    aligh-items: center;
                    background-color: #fff; 
                    border:none ;
                }
                canvas {
                }
            </style>
        `
        }
      
        render() {
            this.shadowRoot.innerHTML = `
            ${this.style()}
            <figure class="audio-player">
                <audio style="display: none"></audio>
                <button class="play-btn" type="button"><img src="assets/icons/play-button.png" style="width:25px"></button>
                <canvas class="visualizer" style="width: 100%; height: 30px"></canvas>
            </figure>
            `;
        
        this.audio = this.shadowRoot.querySelector('audio');
        this.playPauseBtn = this.shadowRoot.querySelector('.play-btn');
        this.canvas = this.shadowRoot.querySelector('canvas');
        
        this.canvasCtx = this.canvas.getContext("2d");
        // support retina display on canvas for a more crispy/HD look
        const scale = window.devicePixelRatio;
        this.canvas.width = Math.floor(this.canvas.width* scale);
        this.canvas.height = Math.floor(this.canvas.height * scale);
        
        // if rendering or re-rendering all audio attributes need to be reset
        for (let i = 0; i < this.attributes.length; i++) {
          const attr = this.attributes[i];
          this.updateAudioAttributes(attr.name, attr.value);
        }
        
        this.attachEvents();
      }
    }
    
    customElements.define('audio-player', AudioPlayer);
  }