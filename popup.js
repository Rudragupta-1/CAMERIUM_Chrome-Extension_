let mediaRecorder;
let recordedChunks = [];
let originalCursorStyle = '';

document.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const cameraFeed = document.getElementById("cameraFeed");
  const filterSelection = document.getElementById("filterSelection");
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const filterSelect = document.getElementById("filter");
  const cursorColorSelect = document.getElementById("cursorColor");
  const cursorOverlay = document.getElementById("cursorOverlay");
  const resolutionSelection = document.getElementById("resolutionSelection");
  const saveRecordingBtn = document.getElementById("saveRecordingBtn");
  const resolutionSelect = document.getElementById("resolution");
  const controls = document.getElementById("controls");

  startBtn.addEventListener("click", async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraFeed.srcObject = cameraStream;
      cameraFeed.style.display = "block";
      filterSelection.style.display = "block";
      originalCursorStyle = document.documentElement.style.cursor; // Save original cursor style
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  });

  filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value;
    cameraFeed.style.filter = filter;
  });

  applyFilterBtn.addEventListener("click", async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const cameraStream = cameraFeed.srcObject;

      const combinedStream = new MediaStream([
        ...displayStream.getTracks(),
        ...cameraStream.getTracks()
      ]);

      // Apply cursor color overlay
      const cursorColor = cursorColorSelect.value;
      if (cursorColor !== 'auto') {
        cursorOverlay.style.display = 'block';
        cursorOverlay.innerHTML = `<div class="cursorCircle" style="background-color: ${cursorColor};"></div>`;
      }

      cameraFeed.classList.add('fullScreen'); // Make camera feed full screen
      controls.style.display = 'none'; // Hide controls

      cameraFeed.addEventListener('mouseenter', () => {
        controls.style.display = 'block'; // Show controls on hover
      });

      cameraFeed.addEventListener('mouseleave', () => {
        controls.style.display = 'none'; // Hide controls when not hovering
      });

      startRecording(combinedStream);
      startBtn.disabled = true;
      stopBtn.disabled = false;
      filterSelection.style.display = "none";
      document.addEventListener('mousemove', updateCursorOverlay);
    } catch (err) {
      console.error("Error accessing display media: ", err);
    }
  });

  stopBtn.addEventListener("click", () => {
    stopRecording();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    cameraFeed.style.display = "none";
    cursorOverlay.style.display = "none";
    document.removeEventListener('mousemove', updateCursorOverlay);
    document.documentElement.style.cursor = originalCursorStyle; // Revert cursor to original style
    resolutionSelection.style.display = 'block'; // Show resolution selection
  });

  saveRecordingBtn.addEventListener("click", () => {
    const resolution = resolutionSelect.value.split('x');
    const width = parseInt(resolution[0]);
    const height = parseInt(resolution[1]);
    saveRecording(width, height);
    resolutionSelection.style.display = 'none';
  });

  function startRecording(stream) {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      console.log("Recording stopped");
    };

    mediaRecorder.start();
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }

  function updateCursorOverlay(event) {
    const cursorCircle = document.querySelector('.cursorCircle');
    if (cursorCircle) {
      cursorCircle.style.left = `${event.clientX}px`;
      cursorCircle.style.top = `${event.clientY}px`;
    }
  }

  function saveRecording(width, height) {
    const webmBlob = new Blob(recordedChunks, { type: "video/webm" });
    
    // Create a temporary video element to load the WebM content
    const video = document.createElement('video');
    video.src = URL.createObjectURL(webmBlob);
    video.controls = true;
    video.style.display = 'none'; // Hide the video element
  
    // Append the video element to the document body
    document.body.appendChild(video);
  
    // Register an event listener to capture the 'loadedmetadata' event
    video.onloadedmetadata = function() {
      // Create a canvas element to draw the video frame
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
  
      // Convert the canvas content to a Blob representing the MP4 file
      canvas.toBlob(function(mp4Blob) {
        // Remove the temporary video element from the document body
        document.body.removeChild(video);
  
        // Create a link element to trigger the download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = URL.createObjectURL(mp4Blob);
        a.download = `screen-recording-${width}x${height}.mp4`;
  
        // Append the link element to the document body and trigger the download
        document.body.appendChild(a);
        a.click();
  
        // Clean up by revoking object URLs
        URL.revokeObjectURL(a.href);
        URL.revokeObjectURL(webmBlob);
      }, 'video/mp4');
    };
  }
  
});
