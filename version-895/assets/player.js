(function () {
  function initPlayer(block) {
    var video = block.querySelector('video');
    var overlay = block.querySelector('.player-overlay');
    var stream = block.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    if (!video || !overlay || !stream) {
      return;
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      block.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          block.classList.remove('is-playing');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      block.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0) {
        block.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.movie-player').forEach(initPlayer);
})();
