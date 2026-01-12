const videoUpload = document.getElementById('videoUpload');
const videoPreview = document.getElementById('videoPreview');
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const overlayText = document.getElementById('overlayText');
const exportBtn = document.getElementById('exportBtn');
const presetButtons = document.querySelectorAll('.presetBtn');
const audioUpload = document.getElementById('audioUpload');
const audioVolume = document.getElementById('audioVolume');

let videos = [];
let currentPreset = 'cinematic';
let audioFile = null;

// Load video clips
videoUpload.addEventListener('change', e => {
    videos = Array.from(e.target.files);
    if(videos.length > 0) videoPreview.src = URL.createObjectURL(videos[0]);
});

// Load background audio
audioUpload.addEventListener('change', e => {
    if(e.target.files.length > 0) audioFile = e.target.files[0];
});

// Preset selection
presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentPreset = btn.dataset.preset;
        alert(`Preset "${currentPreset}" selected!`);
    });
});

// ===============================
// Effects processing
// ===============================
function applyEffects(data, preset, frameIndex){
    for(let i=0;i<data.length;i+=4){
        let r=data[i], g=data[i+1], b=data[i+2];

        switch(preset){
            case 'cinematic':
                let avg = (r+g+b)/3;
                data[i]=data[i+1]=data[i+2]=avg*0.9; break;
            case 'bright':
                data[i]=Math.min(r*1.2,255); data[i+1]=Math.min(g*1.2,255); data[i+2]=Math.min(b*1.2,255); break;
            case 'dramatic':
                data[i]=255-r; data[i+1]=255-g; data[i+2]=255-b; break;
            case 'classic':
                let sepR = r*0.393 + g*0.769 + b*0.189;
                let sepG = r*0.349 + g*0.686 + b*0.168;
                let sepB = r*0.272 + g*0.534 + b*0.131;
                data[i]=Math.min(sepR,255); data[i+1]=Math.min(sepG,255); data[i+2]=Math.min(sepB,255); break;
            case 'vintage':
                data[i]=r*0.9+30; data[i+1]=g*0.85+20; data[i+2]=b*0.8+10; break;
            case 'neon':
                data[i]=255-r; data[i+1]=g; data[i+2]=255-b; break;
            case 'pixelate':
                if(frameIndex%2===0){ data[i]*=0.8; data[i+1]*=0.8; data[i+2]*=0.8; } break;
            case 'blur':
                let avgB = (r+g+b)/3; data[i]=data[i+1]=data[i+2]=avgB; break;
            case 'grayscale':
                let gray=(r+g+b)/3; data[i]=data[i+1]=data[i+2]=gray; break;
            case 'invert':
                data[i]=255-r; data[i+1]=255-g; data[i+2]=255-b; break;
            case 'sepia':
                let sR=r*0.393+g*0.769+b*0.189;
                let sG=r*0.349+g*0.686+b*0.168;
                let sB=r*0.272+g*0.534+b*0.131;
                data[i]=Math.min(sR,255); data[i+1]=Math.min(sG,255); data[i+2]=Math.min(sB,255); break;
            case 'saturate':
                data[i]=Math.min(r*1.5,255); data[i+1]=Math.min(g*1.5,255); data[i+2]=Math.min(b*1.5,255); break;
            case 'hue':
                data[i]=b; data[i+1]=r; data[i+2]=g; break;
            case 'glitch':
                if(frameIndex%5===0){ data[i]=b; data[i+1]=r; data[i+2]=g; } break;
            case 'vhs':
                data[i]=r*0.8; data[i+1]=g*0.9; data[i+2]=b*1.2; break;
            // Add more effects if needed
        }
    }
}

// ===============================
// Play clip on canvas with text animation
// ===============================
function playCanvasVideo(videoEl, preset, text, callback){
    canvas.width=videoEl.videoWidth;
    canvas.height=videoEl.videoHeight;
    let frameIndex=0;
    videoEl.play();

    function draw(){
        if(videoEl.paused || videoEl.ended){
            if(callback) callback();
            return;
        }
        ctx.drawImage(videoEl,0,0,canvas.width,canvas.height);
        let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        applyEffects(imageData.data,preset,frameIndex++);
        ctx.putImageData(imageData,0,0);

        // Animated text: fade + slide + scale
        if(text){
            let alpha=Math.min(1, frameIndex/60);
            let scale=0.5 + 0.5*alpha;
            let yPos=50 + 50*(1-alpha);
            ctx.globalAlpha=alpha;
            ctx.font=`${50*scale}px Arial`;
            ctx.fillStyle='white';
            ctx.fillText(text,50,yPos);
            ctx.globalAlpha=1;
        }

        requestAnimationFrame(draw);
    }
    draw();
}

// ===============================
// Export final video with transitions & audio
// ===============================
exportBtn.addEventListener('click', async ()=>{
    if(videos.length===0){ alert('Upload at least 1 video'); return; }

    let stream = canvas.captureStream(30);
    let recorder = new MediaRecorder(stream);
    let chunks=[];
    recorder.ondataavailable = e=>chunks.push(e.data);
    recorder.onstop = ()=>{
        let blob = new Blob(chunks,{type:'video/webm'});
        let url = URL.createObjectURL(blob);
        let a=document.createElement('a');
        a.href=url; a.download='ultimate_video.webm';
        a.click();
    };
    recorder.start();

    // Play clips sequentially with 1-sec crossfade
    async function playSequential(index){
        if(index>=videos.length){ recorder.stop(); return; }

        let vid=document.createElement('video');
        vid.src=URL.createObjectURL(videos[index]);
        vid.crossOrigin="anonymous";
        await vid.play();

        playCanvasVideo(vid,currentPreset,overlayText.value, async ()=>{
            if(index+1<videos.length){
                let nextVid=document.createElement('video');
                nextVid.src=URL.createObjectURL(videos[index+1]);
                nextVid.crossOrigin="anonymous";
                nextVid.play();
                setTimeout(()=>playSequential(index+1),1000); // crossfade
            } else {
                playSequential(index+1);
            }
        });
    }

    playSequential(0);
});
