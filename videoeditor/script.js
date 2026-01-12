const videoUpload = document.getElementById('videoUpload');
const videoPreview = document.getElementById('videoPreview');
const canvas = document.getElementById('videoCanvas');
const ctx = canvas.getContext('2d');
const overlayText = document.getElementById('overlayText');
const effectSelect = document.getElementById('effectSelect');

let selectedVideoFile = null;

// Load selected video
videoUpload.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectedVideoFile = e.target.files[0];
    const url = URL.createObjectURL(selectedVideoFile);
    videoPreview.src = url;
    videoPreview.load();
  }
});

// Draw video on canvas with overlay text and effect
document.getElementById('previewBtn').addEventListener('click', () => {
  if (!selectedVideoFile) { alert('Please upload a video first!'); return; }

  videoPreview.play();

  // Resize canvas to video
  canvas.width = videoPreview.videoWidth;
  canvas.height = videoPreview.videoHeight;

  function drawFrame() {
    if (videoPreview.paused || videoPreview.ended) return;

    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);

    // Apply effect
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (effectSelect.value !== 'none') applyEffect(imageData, effectSelect.value);
    ctx.putImageData(imageData, 0, 0);

    // Draw text
    if (overlayText.value) {
      ctx.font = '40px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(overlayText.value, 50, 50);
    }

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
});

// Simple effect function
function applyEffect(imageData, effect) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i+1], b = data[i+2];
    if (effect === 'grayscale') {
      let avg = (r+g+b)/3;
      data[i]=data[i+1]=data[i+2]=avg;
    } else if (effect === 'invert') {
      data[i]=255-r; data[i+1]=255-g; data[i+2]=255-b;
    } else if (effect === 'brightness') {
      data[i]=Math.min(r+50,255);
      data[i+1]=Math.min(g+50,255);
      data[i+2]=Math.min(b+50,255);
    }
  }
}
