let mediaRecorder;
let recordedChunks = [];

document.addEventListener("DOMContentLoaded", async () => {
  const video = document.getElementById("video");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

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
      a.download = "recording.webm";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    };

    startBtn.addEventListener("click", () => {
      mediaRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
    });

    stopBtn.addEventListener("click", () => {
      mediaRecorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
    });
  } catch (err) {
    console.error("Error accessing camera: ", err);
  }
});
