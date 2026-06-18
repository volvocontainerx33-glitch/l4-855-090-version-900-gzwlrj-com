(() => {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  };

  ready(() => {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    const syncHeader = () => {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 48);
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && mobileNav) {
      toggle.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
      });

      mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          document.body.classList.remove("menu-open");
        });
      });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
      const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
      const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
      const prev = hero.querySelector("[data-hero-prev]");
      const next = hero.querySelector("[data-hero-next]");
      let current = 0;
      let timer = null;

      const show = (index) => {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("active", dotIndex === current);
        });
      };

      const start = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(current + 1), 5200);
      };

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          show(Number(dot.dataset.heroDot || 0));
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", () => {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", () => {
          show(current + 1);
          start();
        });
      }

      start();
    }

    document.querySelectorAll("[data-filter-input]").forEach((input) => {
      const targetSelector = input.getAttribute("data-filter-target");
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      const cards = target ? Array.from(target.querySelectorAll("[data-card]")) : [];

      input.addEventListener("input", () => {
        const term = input.value.trim().toLowerCase();

        cards.forEach((card) => {
          const haystack = [
            card.textContent || "",
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || ""
          ].join(" ").toLowerCase();

          card.classList.toggle("is-hidden", term !== "" && !haystack.includes(term));
        });
      });
    });
  });
})();
