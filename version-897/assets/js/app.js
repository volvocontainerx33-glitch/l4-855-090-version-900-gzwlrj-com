(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function initMobileNav() {
    var toggle = one(".mobile-toggle");
    var nav = one(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = one("#hero-slider");
    if (!hero) {
      return;
    }
    var slides = all(".hero-slide", hero);
    var dots = all(".hero-dot", hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    start();
  }

  function initSearch() {
    var input = one("#site-search");
    var typeFilter = one("#type-filter");
    var yearFilter = one("#year-filter");
    var clear = one("#clear-search");
    var cards = all(".movie-card");
    if (!input || !cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function apply() {
      var query = normalize(input.value);
      var typeValue = normalize(typeFilter ? typeFilter.value : "");
      var yearValue = normalize(yearFilter ? yearFilter.value : "");
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" "));
        var typeText = normalize(card.getAttribute("data-type"));
        var yearText = normalize(card.getAttribute("data-year"));
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedType = !typeValue || typeText.indexOf(typeValue) !== -1 || haystack.indexOf(typeValue) !== -1;
        var matchedYear = !yearValue || yearText.indexOf(yearValue) !== -1;
        card.classList.toggle("is-filtered-out", !(matchedQuery && matchedType && matchedYear));
      });
    }

    input.addEventListener("input", apply);
    if (typeFilter) {
      typeFilter.addEventListener("change", apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", apply);
    }
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        if (typeFilter) {
          typeFilter.value = "";
        }
        if (yearFilter) {
          yearFilter.value = "";
        }
        apply();
      });
    }
  }

  window.initPlayer = function (videoId, coverId, src) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !cover || !src) {
      return;
    }
    var loaded = false;
    var hls = null;

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function loadAndPlay() {
      cover.classList.add("is-hidden");
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }
      video.src = src;
      video.addEventListener("canplay", playVideo, { once: true });
      video.load();
    }

    cover.addEventListener("click", loadAndPlay);
    video.addEventListener("click", function () {
      if (!loaded) {
        loadAndPlay();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initSearch();
  });
})();
