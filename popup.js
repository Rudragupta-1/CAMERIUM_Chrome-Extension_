let mediaRecorder;
let recordedChunks = [];

document.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const cameraFeed = document.getElementById("cameraFeed");
  const filterSelection = document.getElementById("filterSelection");
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const filterSelect = document.getElementById("filter");

  startBtn.addEventListener("click", async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraFeed.srcObject = cameraStream;
      cameraFeed.style.display = "block";
      filterSelection.style.display = "block";
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

      startRecording(combinedStream);
      startBtn.disabled = true;
      stopBtn.disabled = false;
      filterSelection.style.display = "none";
    } catch (err) {
      console.error("Error accessing display media: ", err);
    }
  });

  stopBtn.addEventListener("click", () => {
    stopRecording();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    cameraFeed.style.display = "none";
  });
});

function startRecording(stream) {
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, {
      type: "video/webm"
    });
    recordedChunks = [];
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "screen-recording.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  mediaRecorder.start();
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}
