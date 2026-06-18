(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileNav && header) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      header.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.closest('section') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var searchInput = panel.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
    var emptyState = scope.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function valuesFor(name) {
      var set = new Set();
      cards.forEach(function (card) {
        if (name === 'genre') {
          String(card.dataset.genre || '').split(/\s+/).forEach(function (item) {
            if (item) {
              set.add(item);
            }
          });
          return;
        }
        var value = card.dataset[name];
        if (value) {
          set.add(value);
        }
      });
      return Array.from(set).sort(function (a, b) {
        if (name === 'year') {
          return Number(b) - Number(a);
        }
        return a.localeCompare(b, 'zh-CN');
      });
    }

    selects.forEach(function (select) {
      var name = select.getAttribute('data-filter-select');
      valuesFor(name).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var activeFilters = {};
      selects.forEach(function (select) {
        var name = select.getAttribute('data-filter-select');
        activeFilters[name] = select.value;
      });
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.type,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) > -1;
        var matchesYear = !activeFilters.year || card.dataset.year === activeFilters.year;
        var matchesRegion = !activeFilters.region || card.dataset.region === activeFilters.region;
        var matchesGenre = !activeFilters.genre || normalize(card.dataset.genre).indexOf(normalize(activeFilters.genre)) > -1;
        var show = matchesQuery && matchesYear && matchesRegion && matchesGenre;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
    applyFilters();
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('.play-trigger');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;

    function hideCover() {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      if (video) {
        video.controls = true;
      }
    }

    function playVideo() {
      if (!video || !stream) {
        return;
      }

      hideCover();

      if (!video.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.dataset.ready = '1';
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          video.dataset.ready = '1';
        } else {
          video.src = stream;
          video.dataset.ready = '1';
        }
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (hlsInstance && window.Hls && window.Hls.Events) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    shell.addEventListener('click', function () {
      if (!video || video.controls) {
        return;
      }
      playVideo();
    });
  });
})();
