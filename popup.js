let mediaRecorder;
let recordedChunks = [];

document.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const cameraFeed = document.getElementById("cameraFeed");

  startBtn.addEventListener("click", async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });

      cameraFeed.srcObject = cameraStream;
      cameraFeed.style.display = "block";

      const combinedStream = new MediaStream([
        ...displayStream.getTracks(),
        ...cameraStream.getTracks()
      ]);

      startRecording(combinedStream);
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } catch (err) {
      console.error("Error accessing media: ", err);
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
