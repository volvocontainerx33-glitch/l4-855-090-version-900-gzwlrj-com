(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("hidden");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      if (!slides.length) {
        return;
      }
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5500);
    });

    document.querySelectorAll("[data-movie-list]").forEach(function (list) {
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      var scope = list.parentElement || document;
      var search = scope.querySelector("[data-search-input]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var emptyState = scope.querySelector("[data-empty-state]");
      function uniqueValues(name) {
        var values = cards.map(function (card) {
          return card.getAttribute(name) || "";
        }).filter(Boolean);
        return Array.prototype.slice.call(new Set(values)).sort(function (a, b) {
          return a.localeCompare(b, "zh-CN");
        });
      }
      function fill(select, values) {
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
      fill(typeSelect, uniqueValues("data-type"));
      fill(regionSelect, uniqueValues("data-region"));
      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var matched = (!q || text.indexOf(q) !== -1) && (!type || card.getAttribute("data-type") === type) && (!region || card.getAttribute("data-region") === region);
          card.classList.toggle("hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle("hidden", visible !== 0);
        }
      }
      [search, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && search) {
        search.value = query;
      }
      apply();
    });
  });
}());
