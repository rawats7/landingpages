const videoUpload = document.getElementById('videoUpload');
const videoPreview = document.getElementById('videoPreview');
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const overlayText = document.getElementById('overlayText');
const exportBtn = document.getElementById('exportBtn');
const presetButtons = document.querySelectorAll('.presetBtn');
const audioUpload = document.getElementById('audioUpload');

let videos = [];
let currentPreset = 'cinematic';
let audioFile = null;

// Load video clips
videoUpload.addEventListener('change', e => {
  videos = Array.from(e.target.files);
  if (videos.length > 0) {
    videoPreview.src = URL.createObjectURL(videos[0]);
  }
});

// Load background audio
audioUpload.addEventListener('change', e => {
  if (e.target.files.length > 0) {
    audioFile = e.target.files[0];
  }
});

// Preset selection
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentPreset = btn.dataset.preset;
    alert(`Preset "${currentPreset}" selected!`);
  });
});

// Canvas preview & effect application
function playCanvasVideo(videoElement, preset, text, callback) {
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  videoElement.play();

  function drawFrame() {
    if (videoElement.paused || videoElement.ended) { 
      if(callback) callback();
      return; 
    }

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    applyPresetEffect(imageData, preset);
    ctx.putImageData(imageData,0,0);

    if(text){
      ctx.font = '50px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(text, 50, 80);
    }

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

// Apply preset effects
function applyPresetEffect(imageData, preset){
  const data = imageData.data;
  for(let i=0;i<data.length;i+=4){
    let r=data[i], g=data[i+1], b=data[i+2];
    if(preset==='cinematic'){
      let avg = (r+g+b)/3;
      data[i]=data[i+1]=data[i+2]=avg*0.9; // slight grayscale + dark
    } else if(preset==='bright'){
      data[i]=Math.min(r*1.2,255); data[i+1]=Math.min(g*1.2,255); data[i+2]=Math.min(b*1.2,255);
    } else if(preset==='dramatic'){
      data[i]=255-r; data[i+1]=255-g; data[i+2]=255-b; // invert
    } else if(preset==='classic'){
      let sepiaR = r*0.393 + g*0.769 + b*0.189;
      let sepiaG = r*0.349 + g*0.686 + b*0.168;
      let sepiaB = r*0.272 + g*0.534 + b*0.131;
      data[i]=Math.min(sepiaR,255); data[i+1]=Math.min(sepiaG,255); data[i+2]=Math.min(sepiaB,255);
    }
  }
}

// Export final video
exportBtn.addEventListener('click', async ()=>{
  if(videos.length===0){ alert('Upload at least 1 video!'); return;}
  
  let stream = canvas.captureStream(30); // 30fps
  let recorder = new MediaRecorder(stream);
  let chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = async ()=>{
    let blob = new Blob(chunks,{type:'video/webm'});
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url; a.download = 'final_video.webm';
    a.click();
  };

  recorder.start();

  // Play each video in sequence with preset
  async function playVideosSequentially(index){
    if(index>=videos.length){
      recorder.stop();
      return;
    }
    let vid = document.createElement('video');
    vid.src = URL.createObjectURL(videos[index]);
    vid.crossOrigin="anonymous";
    await vid.play();
    playCanvasVideo(vid, currentPreset, overlayText.value, ()=>{
      playVideosSequentially(index+1);
    });
  }

  playVideosSequentially(0);
});
