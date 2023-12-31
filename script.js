const slides = document.querySelector(".slides");
const recordButton = document.getElementById("record-button");
const postButton = document.getElementById("post-button");
const buttons = document.querySelector(".buttons");
const DROPDOWN = document.getElementById("myDropdown");
const OPTIONS = document.querySelector("#options");
const video = document.querySelector("#video");
const state = document.getElementById("state");
const categorySearch = document.getElementById("myInput");
const categorySearch2 = document.getElementById("myInput2");
const DROPDOWN2 = document.getElementById("myDropdown2");
const OPTIONS2 = document.querySelector("#options2");

let isDragging = false;
let startPosX = 0;
let currentTranslate = 0;
let currentIndex = 1;
let recordingState = null;
let chunks = [];
let mediaRecorder;
let recordedVideoURL = null;
const threshold = 50;

const CATEGORIES = ["Fun", "Cooking", "Fashion", "Movies", "Nature"];

CATEGORIES.forEach((cat) => {
  drawOption(cat);
  drawOption2(cat);
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
categorySearch2.addEventListener("input", filterCategories2);

categorySearch.addEventListener("click", () => {
  document.querySelector("#options").style.display = "block";
});
categorySearch2.addEventListener("click", () => {
  document.querySelector("#options2").style.display = "block";
});

document.querySelector("#filter_open").addEventListener("click", () => {
  document.querySelector("#filter").style.right = "0px";
});

document.querySelector("#filter_close").addEventListener("click", () => {
  document.querySelector("#filter").style.right = "-100vw";
});

// Set the initial position to the middle slide
currentTranslate = currentIndex * -window.innerWidth;
slides.style.transform = `translateX(${currentTranslate}px)`;

slides.addEventListener("touchstart", (e) => {
  isDragging = true;
  startPosX = e.touches[0].clientX;
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
  if (recordingState === null) {
    enableMedia();
  }
  currentTranslate = currentIndex * -window.innerWidth;
  slides.style.transform = `translateX(${currentTranslate}px)`;
});

function enableMedia() {
  recordingState = "live";
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
  DROPDOWN.style.display = "none";
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
    let caps = CATEGORIES.map((cat) => cat.toLowerCase());
    if (!caps.includes(input.toLowerCase())) {
      let custom = document.createElement("span");
      custom.id = "custom_option";
      custom.textContent = "Add: " + input;
      OPTIONS.appendChild(custom);
    }
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

function filterCategories2(event) {
  const categorisSpan2 = Array.from(
    document.querySelector("#options2").children
  );
  const input = event.target.value;

  categorisSpan2.forEach((span) => {
    if (!span.textContent.toLowerCase().includes(input.toLowerCase())) {
      span.remove();
    }
  });
  CATEGORIES.forEach((category) => {
    if (category.toLowerCase().includes(input.toLowerCase())) {
      let isAlready = false;
      categorisSpan2.forEach((span) => {
        if (span.textContent.toLowerCase() === category.toLowerCase()) {
          isAlready = true;
        }
      });
      if (!isAlready) {
        drawOption2(category);
      }
    }
  });

  if (input.length > 30) {
    let custom = document.createElement("span");
    custom.id = "custom_option2";
    custom.textContent = "Invalid: Max 30 char.";
    OPTIONS2.appendChild(custom);
  }
}

function drawOption(category) {
  let option = document.createElement("span");
  option.textContent = category;
  option.addEventListener("click", () => {
    categorySearch.value = category;
    document.querySelector("#options").style.display = "none";
  });
  OPTIONS.appendChild(option);
}

function drawOption2(category) {
  let option = document.createElement("span");
  option.textContent = category;

  option.addEventListener("click", () => {
    categorySearch2.value = category;
    document.querySelector("#options2").style.display = "none";
  });
  OPTIONS2.appendChild(option);
}

window.addEventListener("click", (event) => {
  if (
    event.target.classList.contains("wrapper") ||
    event.target.id === "video"
  ) {
    document.querySelector("#options2").style.display = "none";
    document.querySelector("#options").style.display = "none";
  }
});

// video controls
const videos = document.querySelectorAll(".app");

videoController();

document.querySelector("#reels").addEventListener("scroll", videoController);

function videoController() {
  videos.forEach((video) => {
    if (isCenterInViewport(video)) {
      video.children[0].children[0].play();
      Array.from(video.children[2].children).forEach((star, index) => {
        star.addEventListener("click", (event) => {
          // Add "fa-bounce" class to the clicked star
          event.target.classList.add("fa-bounce");

          // Find the parent div with class "stars"
          const starsParent = video.children[2];

          if (starsParent) {
            // Get all child stars within the same parent div
            const allStars = starsParent.querySelectorAll("i");

            // Add "fa-solid" class to stars from index 0 to the clicked star's index
            for (let i = 0; i <= index; i++) {
              allStars[i].classList.add("fa-solid");
            }

            // Find the closest div with class "app"
            const appDiv = video;

            if (appDiv) {
              // Scroll to the sibling div with class "app"
              const siblingAppDiv = appDiv.nextElementSibling;
              if (siblingAppDiv && siblingAppDiv.classList.contains("app")) {
                setTimeout(() => {
                  siblingAppDiv.scrollIntoView({ behavior: "smooth" });
                },500);
              }
            }
          }
        });
      });
    } else {
      video.children[0].children[0].pause();
    }
  });
}

function isCenterInViewport(element) {
  const elementRect = element.getBoundingClientRect();
  return elementRect.top === 0;
}
