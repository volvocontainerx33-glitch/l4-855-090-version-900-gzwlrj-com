(function () {
  const setupPlayer = function (shell) {
    const video = shell.querySelector("video");
    const overlay = shell.querySelector(".player-overlay");
    const source = shell.getAttribute("data-hls");

    if (!video || !source) {
      return;
    }

    const attach = function () {
      if (shell.getAttribute("data-ready") === "1") {
        return;
      }
      shell.setAttribute("data-ready", "1");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        shell.hlsInstance = hls;
      } else {
        video.src = source;
      }
    };

    const play = function () {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  };

  document.querySelectorAll(".player-shell").forEach(setupPlayer);
})();
