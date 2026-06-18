(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = index;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function next() {
      show((current + 1) % slides.length);
    }
    function start() {
      stop();
      timer = window.setInterval(next, 5000);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var query = scope.querySelector("[data-filter-query]");
    var year = scope.querySelector("[data-filter-year]");
    var type = scope.querySelector("[data-filter-type]");
    var region = scope.querySelector("[data-filter-region]");
    var category = scope.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var empty = scope.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (query && initial) {
      query.value = initial;
    }
    function apply() {
      var q = normalize(query && query.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var selectedRegion = normalize(region && region.value);
      var selectedCategory = normalize(category && category.value);
      var visible = 0;
      cards.forEach(function(card) {
        var search = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var matched = true;
        if (q && search.indexOf(q) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedType && cardType.indexOf(selectedType) === -1) {
          matched = false;
        }
        if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1 && search.indexOf(selectedRegion) === -1) {
          matched = false;
        }
        if (selectedCategory && cardCategory !== selectedCategory && cardGenre.indexOf(selectedCategory) === -1) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    [query, year, type, region, category].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function(player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var url = player.getAttribute("data-video");
      var attached = false;
      var hls = null;
      if (!video || !url) {
        return;
      }
      function attach() {
        if (attached) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          player._hls = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          video.src = url;
        }
        attached = true;
      }
      function begin() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function() {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }
      if (cover) {
        cover.addEventListener("click", begin);
      }
      video.addEventListener("play", function() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
      video.addEventListener("click", function() {
        if (!attached || video.paused) {
          begin();
        }
      });
      window.addEventListener("pagehide", function() {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
