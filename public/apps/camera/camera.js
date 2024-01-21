let el_video = document.getElementsByTagName("video")[0]
let el_videoOverlay = document.querySelector(".video-container .overlay");
let el_videoOverlay_text = el_videoOverlay.firstElementChild;
let el_startStopToggle = document.querySelector(".controls-container .start-stop");
let el_capture = document.querySelector(".controls-container .capture");
let el_gallery = document.querySelector(".controls-container .gallery");

let vidToggle = true;

window.onload = () => {

     el_startStopToggle.firstElementChild.classList.add("hide")
     startVideo();

     el_startStopToggle.addEventListener("click", () => {

          if (vidToggle) {
               //vid is playing, stop it
               stopVideo();
               //show "start cam"
               el_startStopToggle.firstElementChild.classList.remove("hide")
               //hide "Stop Cam"
               el_startStopToggle.lastElementChild.classList.add("hide")
          } else {
               //video is stopped, play it
               startVideo();
               //hide "start cam"
               el_startStopToggle.firstElementChild.classList.add("hide")
               //show "Stop Cam"
               el_startStopToggle.lastElementChild.classList.remove("hide")
          }

          vidToggle = !vidToggle;

     })

}

function startVideo() {
     navigator.mediaDevices.getUserMedia({ video: true }).then(
          (stream) => {
               el_video.classList.remove("hide")
               el_videoOverlay.classList.add("hide");
               el_video.srcObject = stream
          }
     ).catch(
          (errObj) => {
               el_videoOverlay.classList.remove("hide")

               if (errObj.name == "NotAllowedError") {
                    el_videoOverlay_text.innerHTML = "Permission Denied.";
               } else {
                    el_videoOverlay_text.innerHTML = "Unable to load camera resource. \n(ERROR) " + errObj.name + " : " + errObj.message;
               }
          }
     )
}

function stopVideo() {
     el_video.srcObject.getTracks().forEach((track) => { track.stop() });
     el_videoOverlay.classList.remove("hide")
     el_videoOverlay_text.innerHTML="paused";
     el_video.classList.add("hide")
}