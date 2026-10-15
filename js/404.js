(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var navToggle = document.querySelector(".nav-toggle");
  var primaryNav = document.querySelector(".primary-nav");
  var backToTop = document.querySelector("[data-back-to-top]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setHeaderState() {
    var hasScrolled = window.scrollY > 12;

    if (header) {
      header.classList.toggle("is-scrolled", hasScrolled);
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 500);
    }
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  function closeMobileNav(restoreFocus) {
    if (!navToggle || !primaryNav) {
      return;
    }

    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    primaryNav.classList.remove("is-open");

    if (restoreFocus) {
      navToggle.focus();
    }
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";

      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      primaryNav.classList.toggle("is-open", !isOpen);

      if (!isOpen) {
        var firstLink = primaryNav.querySelector("a");
        if (firstLink) {
          firstLink.focus();
        }
      }
    });

    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileNav(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        closeMobileNav(true);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 992) {
        closeMobileNav(false);
      }
    });
  }

  var revealItems = document.querySelectorAll("[data-reveal]");

  if (revealItems.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* Go Back with a sensible fallback */
  var goBackButton = document.querySelector("[data-go-back]");

  if (goBackButton) {
    goBackButton.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  }

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }
  var newsletterForm = document.querySelector("[data-newsletter-form]");

  if (newsletterForm) {
    var newsletterInput = newsletterForm.querySelector("input[type=\"email\"]");
    var newsletterStatus = newsletterForm.querySelector("[data-newsletter-status]");
    var newsletterTimer;
    var newsletterPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = newsletterInput ? newsletterInput.value.trim() : "";
      window.clearTimeout(newsletterTimer);

      if (newsletterStatus) {
        newsletterStatus.classList.remove("is-error", "is-success");
      }

      if (!newsletterPattern.test(value)) {
        if (newsletterInput) {
          newsletterInput.setAttribute("aria-invalid", "true");
          newsletterInput.focus();
        }
        if (newsletterStatus) {
          newsletterStatus.textContent = value ? "Please enter a valid email address." : "Please enter your email address.";
          newsletterStatus.classList.add("is-error");
        }
        return;
      }

      if (newsletterInput) {
        newsletterInput.removeAttribute("aria-invalid");
      }

      newsletterForm.reset();

      if (newsletterStatus) {
        newsletterStatus.textContent = "You are on the list. Thank you for being here.";
        newsletterStatus.classList.add("is-success");
        newsletterTimer = window.setTimeout(function () {
          newsletterStatus.textContent = "";
          newsletterStatus.classList.remove("is-success");
        }, 3000);
      }
    });
  }
})();


/* Highlight the current page in the header navigation */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll(".primary-nav .nav-link"));
  if (!links.length) {
    return;
  }

  var current = window.location.pathname.split("/").pop() || "index.html";

  links.forEach(function (link) {
    var href = link.getAttribute("href") || "";

    if (href.charAt(0) === "#") {
      return;
    }

    var path = href.split("#")[0].split("?")[0];
    var isCurrent = path === current;

    link.classList.toggle("is-active", isCurrent);

    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
})();

/* Close the mobile navigation drawer when clicking the scrim / outside */
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".primary-nav");
  if (!toggle || !nav) {
    return;
  }

  document.addEventListener("click", function (event) {
    if (!nav.classList.contains("is-open")) {
      return;
    }

    if (nav.contains(event.target) || toggle.contains(event.target)) {
      return;
    }

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    nav.classList.remove("is-open");
  });
})();
