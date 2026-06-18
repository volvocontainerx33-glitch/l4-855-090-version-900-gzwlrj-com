(function () {
  var header = document.querySelector(".site-header");
  var menuButton = document.querySelector(".menu-toggle");

  if (header && menuButton) {
    menuButton.addEventListener("click", function () {
      var opened = header.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var input = panel.querySelector("[data-filter-input]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var targetSelector = panel.getAttribute("data-target");
    var list = targetSelector ? document.querySelector(targetSelector) : null;
    var scope = list || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    function uniqueValues(name) {
      var values = cards.map(function (card) {
        return card.getAttribute(name) || "";
      }).filter(Boolean);

      return Array.from(new Set(values)).sort(function (a, b) {
        return String(b).localeCompare(String(a), "zh-CN");
      });
    }

    function fillSelect(select, values) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(yearSelect, uniqueValues("data-year"));
    fillSelect(typeSelect, uniqueValues("data-type"));

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var search = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;

        if (query && search.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
}());
