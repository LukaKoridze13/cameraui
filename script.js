const slides = document.querySelector(".slides");
const recordButton = document.getElementById("record-button");
const video = document.querySelector("#video");
const state = document.getElementById("state");
let isDragging = false;
let startPosX = 0;
let currentTranslate = 0;
let currentIndex = 0;
let recordingState = "live";
let chunks = [];
let mediaRecorder;
let recordedVideoURL = null;
const threshold = 50;

recordButton.addEventListener("click", () => {
  if (recordingState === "live") {
    startRecording();
    state.textContent = "Recording...";
  }
  if (recordingState === "recorded") {
    startOver();
  }
});

slides.addEventListener("touchstart", (e) => {
  isDragging = true;
  startPosX = e.touches[0].clientX;
});

slides.addEventListener("touchmove", (e) => {
  if (!isDragging) return;

  const distanceX = e.touches[0].clientX - startPosX;

  if (
    (currentIndex === 0 && distanceX > 0) ||
    (currentIndex === slides.children.length - 1 && distanceX < 0)
  ) {
    return;
  }

  currentTranslate = currentIndex * -window.innerWidth + distanceX;

  slides.style.transition = "none";
  slides.style.transform = `translateX(${currentTranslate}px)`;
});

slides.addEventListener("touchend", (e) => {
  if (!isDragging) return;

  isDragging = false;

  const distanceX = e.changedTouches[0].clientX - startPosX;
  slides.style.transition = "transform 0.4s ease-in-out";

  if (distanceX > threshold && currentIndex > 0) {
    currentIndex--;
  } else if (
    distanceX < -threshold &&
    currentIndex < slides.children.length - 1
  ) {
    currentIndex++;
  }
  if (currentIndex === 1) {
    setTimeout(enableMedia, 200);
  } else {
    startOver();
  }

  currentTranslate = currentIndex * -window.innerWidth;
  slides.style.transform = `translateX(${currentTranslate}px)`;
});

function enableMedia() {
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: {
          exact: "user",
        },
      },
      audio: true,
    })
    .then(function (stream) {
      video.srcObject = stream;
      video.muted = true;
    });
}

function startRecording() {
  recordButton.style.display = "none";
  mediaRecorder = new MediaRecorder(video.srcObject);
  recordingState = "recording";
  chunks = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };
  mediaRecorder.onstop = () => {
    const recordedBlob = new Blob(chunks, { type: "video/webm" });
    recordedVideoURL = URL.createObjectURL(recordedBlob);
    video.srcObject = null;
    video.src = recordedVideoURL;
    video.loop = true;
    video.muted = false;
    video.play();
  };

  mediaRecorder.start();
  setTimeout(stopRecording, 3500);
}

function stopRecording() {
  recordButton.style.display = "block";
  recordingState = "recorded";
  mediaRecorder.stop();
  state.textContent = "";
  recordButton.textContent = "Start over";
}

function startOver() {
  recordButton.textContent = "";
  recordingState = "live";
  video.src = "";
  video.loop = false;
  video.muted = true;
  enableMedia();
}
