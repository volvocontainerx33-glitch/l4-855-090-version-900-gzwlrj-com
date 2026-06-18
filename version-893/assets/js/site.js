(function () {
  const mobileButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  const topButton = document.querySelector(".back-top");

  if (topButton) {
    window.addEventListener("scroll", function () {
      topButton.classList.toggle("show", window.scrollY > 520);
    });

    topButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("active");
    }));

    const show = function (target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  const input = document.querySelector("[data-search-input]");
  const grid = document.querySelector("[data-card-grid]");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const sortSelect = document.querySelector("[data-sort-select]");

  if (grid) {
    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    let filter = "all";

    const normalize = function (value) {
      return String(value || "").trim().toLowerCase();
    };

    const apply = function () {
      const query = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        const haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.getAttribute("data-year")
        ].join(" "));
        const queryMatch = !query || haystack.indexOf(query) !== -1;
        const filterMatch = filter === "all" || haystack.indexOf(normalize(filter)) !== -1;
        card.classList.toggle("is-hidden-card", !(queryMatch && filterMatch));
      });
    };

    if (input) {
      const params = new URLSearchParams(window.location.search);
      const initial = params.get("q");
      if (initial) {
        input.value = initial;
      }
      input.addEventListener("input", apply);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        filterButtons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        filter = button.getAttribute("data-filter") || "all";
        apply();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        const value = sortSelect.value;
        const sorted = cards.slice().sort(function (a, b) {
          if (value === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (value === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (value === "title") {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
          }
          return cards.indexOf(a) - cards.indexOf(b);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        apply();
      });
    }

    apply();
  }
})();
