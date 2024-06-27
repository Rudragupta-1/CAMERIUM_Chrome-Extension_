document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('video');

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function(error) {
        console.error("Error accessing the camera: ", error);
        if (error.name === "NotAllowedError") {
          alert("Camera access was denied. Please allow camera access and try again.");
        } else if (error.name === "NotFoundError") {
          alert("No camera found. Please connect a camera and try again.");
        } else {
          alert("An error occurred while accessing the camera: " + error.message);
        }
      });
  } else {
    console.error("getUserMedia not supported in this browser.");
    alert("Your browser does not support camera access.");
  }
});
