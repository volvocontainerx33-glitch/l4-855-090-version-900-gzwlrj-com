(function () {
  var header = document.querySelector("[data-header]");
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  var backTop = document.querySelector("[data-back-top]");

  function updateHeader() {
    var scrolled = window.scrollY > 12;
    if (header) {
      header.classList.toggle("is-scrolled", scrolled);
    }
    if (backTop) {
      backTop.classList.toggle("show", window.scrollY > 480);
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && mobileNav && header) {
    menuButton.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("open");
      header.classList.toggle("menu-open", opened);
      menuButton.textContent = opened ? "×" : "☰";
    });
  }

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-movie-filter]").forEach(function (panel) {
    var scope = panel.closest("main") || document;
    var input = panel.querySelector("[data-filter-input]");
    var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-filter-card"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var activeChip = "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
    }

    function applyFilter() {
      var query = normalize(input ? input.value : "");
      var chip = normalize(activeChip);
      cards.forEach(function (card) {
        var haystack = cardText(card);
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchChip = !chip || haystack.indexOf(chip) !== -1;
        card.classList.toggle("is-hidden", !(matchQuery && matchChip));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = chip.getAttribute("data-filter-chip") || "";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  });
})();
