(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
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

  if (toggle && mobileNav && header) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      header.classList.toggle('menu-active', open);
      document.body.classList.toggle('menu-open', open);
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-thumb]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var searchInput = panel.querySelector('[data-search-input]');
    var typeFilter = panel.querySelector('[data-type-filter]');
    var categoryFilter = panel.querySelector('[data-category-filter]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var typeValue = typeFilter ? typeFilter.value : 'all';
      var categoryValue = categoryFilter ? categoryFilter.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardType = card.getAttribute('data-type') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = typeValue === 'all' || cardType.indexOf(typeValue) !== -1;
        var matchesCategory = categoryValue === 'all' || cardCategory === categoryValue;
        var showCard = matchesQuery && matchesType && matchesCategory;
        card.classList.toggle('is-hidden', !showCard);
        if (showCard) {
          visible += 1;
        }
      });

      panel.classList.toggle('is-empty', visible === 0);
    }

    [searchInput, typeFilter, categoryFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
    applyFilters();
  });
})();
