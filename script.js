const slides = document.querySelector(".slides");
const recordButton = document.getElementById("record-button");
const postButton = document.getElementById("post-button");
const buttons = document.querySelector(".buttons");
const DROPDOWN = document.getElementById("myDropdown");
const OPTIONS = document.querySelector("#options");
const video = document.querySelector("#video");
const state = document.getElementById("state");
const categorySearch = document.getElementById("myInput");
let isDragging = false;
let startPosX = 0;
let currentTranslate = 0;
let currentIndex = 1;
let recordingState = "live";
let chunks = [];
let mediaRecorder;
let recordedVideoURL = null;
const threshold = 50;

const CATEGORIES = ["Fun", "Cooking", "Fashion", "Movies", "Nature"];

CATEGORIES.forEach((cat) => {
  drawOption(cat);
});

recordButton.addEventListener("click", () => {
  if (recordingState === "live") {
    startRecording();
    state.textContent = "Recording...";
  }
  if (recordingState === "recorded") {
    startOver();
  }
});
categorySearch.addEventListener("input", filterCategories);

// Set the initial position to the middle slide
currentTranslate = currentIndex * -window.innerWidth;
slides.style.transform = `translateX(${currentTranslate}px)`;

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
  if (currentIndex === 0) {
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
  buttons.style.display = "none";
  DROPDOWN.style.display = "none";

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
  buttons.style.display = "flex";
  postButton.style.display = "block";
  recordingState = "recorded";
  mediaRecorder.stop();
  state.textContent = "";
  recordButton.textContent = "Start over";
  DROPDOWN.style.display = "block";
}

function startOver() {
  recordButton.textContent = "";
  postButton.style.display = "none";
  recordingState = "live";
  video.src = "";
  video.loop = false;
  video.muted = true;
  enableMedia();
}

function filterCategories(event) {
  const categorisSpan = Array.from(document.querySelector("#options").children);
  const input = event.target.value;
  categorisSpan.forEach((span) => {
    if (!span.textContent.toLowerCase().includes(input.toLowerCase())) {
      span.remove();
    }
  });
  CATEGORIES.forEach((category) => {
    if (category.toLowerCase().includes(input.toLowerCase())) {
      let isAlready = false;
      categorisSpan.forEach((span) => {
        if (span.textContent.toLowerCase() === category.toLowerCase()) {
          isAlready = true;
        }
      });
      if (!isAlready) {
        drawOption(category);
      }
    }
  });
  if (input.length > 0) {
    if (document.getElementById("custom_option")) {
      document.getElementById("custom_option").remove();
    }
    let custom = document.createElement("span");
    custom.id = "custom_option";
    custom.textContent = "Add: " + input;
    OPTIONS.appendChild(custom);
  } else {
    document.getElementById("custom_option").remove();
  }
  if (input.length > 30) {
    if (document.getElementById("custom_option")) {
      document.getElementById("custom_option").remove();
      let custom = document.createElement("span");
      custom.id = "custom_option";
      custom.textContent = "Invalid: Max 30 char.";
      OPTIONS.appendChild(custom);
    }
  }
}

function drawOption(category) {
  let option = document.createElement("span");
  option.textContent = category;
  option.addEventListener("click", () => {
    categorySearch.value = category;
    categorySearch.blur();
  });
  OPTIONS.appendChild(option);
}
