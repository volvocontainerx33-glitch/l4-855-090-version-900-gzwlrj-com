import { H as Hls } from "./hls.js";

const initializePlayers = () => {
  document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-play-button]");

    if (!video || !button) {
      return;
    }

    const stream = video.getAttribute("data-stream");
    let hls = null;

    const loadVideo = () => {
      if (!stream || video.dataset.ready === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.dataset.ready = "1";
    };

    const playVideo = () => {
      loadVideo();
      player.classList.add("is-playing");
      video.controls = true;
      const attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          player.classList.remove("is-playing");
        });
      }
    };

    button.addEventListener("click", playVideo);

    video.addEventListener("click", () => {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", () => {
      player.classList.add("is-playing");
    });

    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePlayers);
} else {
  initializePlayers();
}
