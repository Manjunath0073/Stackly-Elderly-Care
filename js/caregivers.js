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

  var counterItems = document.querySelectorAll("[data-counter]");

  function animateCounter(item) {
    var target = Number(item.dataset.counter || 0);
    var suffix = item.dataset.suffix || "";
    var duration = reducedMotion ? 0 : 1400;
    var startTime = null;

    function render(value) {
      item.textContent = new Intl.NumberFormat("en-US").format(value) + suffix;
    }

    if (!duration) {
      render(target);
      return;
    }

    function step(timestamp) {
      if (!startTime) {
        startTime = timestamp;
      }

      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      render(Math.floor(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        render(target);
      }
    }

    window.requestAnimationFrame(step);
  }

  if (counterItems.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.55 });

    counterItems.forEach(function (item) {
      counterObserver.observe(item);
    });
  } else {
    counterItems.forEach(animateCounter);
  }

  /* Caregiver directory filters */
  var directory = document.querySelector("[data-directory-grid]");

  if (directory) {
    var cards = Array.prototype.slice.call(directory.querySelectorAll(".cg-card"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".cg-filter"));
    var countEl = document.querySelector("[data-directory-count]");
    var emptyEl = document.querySelector("[data-directory-empty]");
    var activeFilters = { specialty: "all", language: "all" };

    function applyFilters() {
      var shown = 0;

      cards.forEach(function (card) {
        var specialties = (card.dataset.specialty || "").split(" ");
        var languages = (card.dataset.language || "").split(" ");
        var specialtyOk = activeFilters.specialty === "all" || specialties.indexOf(activeFilters.specialty) !== -1;
        var languageOk = activeFilters.language === "all" || languages.indexOf(activeFilters.language) !== -1;
        var isVisible = specialtyOk && languageOk;

        card.hidden = !isVisible;

        if (isVisible) {
          shown += 1;
        }
      });

      if (countEl) {
        var prefix = shown === cards.length ? "Showing all " : "Showing ";
        countEl.textContent = prefix + shown + (shown === 1 ? " caregiver" : " caregivers");
      }

      if (emptyEl) {
        emptyEl.hidden = shown !== 0;
      }
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilters[button.dataset.filter] = button.dataset.value;

        filterButtons.forEach(function (other) {
          if (other.dataset.filter !== button.dataset.filter) {
            return;
          }

          var isActive = other === button;
          other.classList.toggle("is-active", isActive);
          other.setAttribute("aria-pressed", String(isActive));
        });

        applyFilters();
      });
    });
  }

  /* Caregiver profile modal */
  var modal = document.querySelector("[data-profile-modal]");

  if (modal) {
    var modalPanel = modal.querySelector(".cg-modal__panel");
    var modalImage = modal.querySelector("[data-profile-image]");
    var modalRole = modal.querySelector("[data-profile-role]");
    var modalName = modal.querySelector("[data-profile-name]");
    var modalBio = modal.querySelector("[data-profile-bio]");
    var modalYears = modal.querySelector("[data-profile-years]");
    var modalSpecialty = modal.querySelector("[data-profile-specialty]");
    var modalLanguages = modal.querySelector("[data-profile-languages]");
    var lastTrigger = null;

    function modalFocusable() {
      return Array.prototype.slice.call(
        modalPanel.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
      );
    }

    function openModal(trigger) {
      lastTrigger = trigger;
      modalImage.src = trigger.dataset.profileImage || modalImage.src;
      modalImage.alt = trigger.dataset.profileAlt || "";
      modalRole.textContent = trigger.dataset.profileRole || "";
      modalName.textContent = trigger.dataset.profileName || "";
      modalBio.textContent = trigger.dataset.profileBio || "";
      modalYears.textContent = trigger.dataset.profileYears || "";
      modalSpecialty.textContent = trigger.dataset.profileSpecialty || "";
      modalLanguages.textContent = trigger.dataset.profileLanguages || "";

      modal.hidden = false;
      document.body.classList.add("cg-modal-open");

      var closeButton = modalPanel.querySelector(".cg-modal__close");
      if (closeButton) {
        closeButton.focus();
      }
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("cg-modal-open");

      if (lastTrigger) {
        lastTrigger.focus();
      }
    }

    document.querySelectorAll("[data-profile-open]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openModal(trigger);
      });
    });

    modal.querySelectorAll("[data-profile-close]").forEach(function (closer) {
      closer.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (event) {
      if (modal.hidden) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key === "Tab") {
        var focusable = modalFocusable();

        if (!focusable.length) {
          return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* Caregiver stories slider */
  var slider = document.querySelector("[data-testimonial-slider]");

  if (slider) {
    var sliderRoot = slider.parentElement;
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(sliderRoot.querySelectorAll("[data-slide-to]"));
    var previousButton = sliderRoot.querySelector("[data-slider-prev]");
    var nextButton = sliderRoot.querySelector("[data-slider-next]");
    var toggleButton = sliderRoot.querySelector("[data-slider-toggle]");
    var currentSlide = 0;
    var sliderTimer;
    var isPaused = false;

    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        var isCurrent = slideIndex === currentSlide;
        slide.hidden = !isCurrent;
        slide.classList.toggle("is-active", isCurrent);
        slide.setAttribute("aria-hidden", String(!isCurrent));
      });

      dots.forEach(function (dot, dotIndex) {
        var isCurrent = dotIndex === currentSlide;
        dot.classList.toggle("is-active", isCurrent);
        dot.setAttribute("aria-current", String(isCurrent));
      });
    }

    function stopSlider() {
      window.clearInterval(sliderTimer);
    }

    function startSlider() {
      stopSlider();
      if (!reducedMotion && !isPaused) {
        sliderTimer = window.setInterval(function () {
          showSlide(currentSlide + 1);
        }, 7500);
      }
    }

    function reflectToggleState() {
      if (!toggleButton) {
        return;
      }

      var icon = toggleButton.querySelector("[data-slider-toggle-icon]");
      toggleButton.setAttribute("aria-pressed", String(isPaused));
      toggleButton.setAttribute("aria-label", isPaused ? "Play story rotation" : "Pause story rotation");

      if (icon) {
        icon.innerHTML = isPaused ? "&#9654;" : "&#10073;&#10073;";
      }
    }

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        showSlide(currentSlide - 1);
        startSlider();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(currentSlide + 1);
        startSlider();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.slideTo));
        startSlider();
      });
    });

    if (toggleButton) {
      toggleButton.addEventListener("click", function () {
        isPaused = !isPaused;
        reflectToggleState();
        startSlider();
      });
    }

    sliderRoot.addEventListener("mouseenter", stopSlider);
    sliderRoot.addEventListener("mouseleave", startSlider);
    sliderRoot.addEventListener("focusin", stopSlider);
    sliderRoot.addEventListener("focusout", function () {
      if (!sliderRoot.contains(document.activeElement)) {
        startSlider();
      }
    });

    showSlide(0);
    reflectToggleState();
    startSlider();
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
