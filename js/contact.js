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

  /* FAQ accordion */
  var faq = document.querySelector("[data-faq]");

  if (faq) {
    var faqItems = Array.prototype.slice.call(faq.querySelectorAll(".faq-item"));

    function setFaqItem(item, open) {
      var button = item.querySelector(".faq-question");
      var answer = item.querySelector(".faq-answer");

      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      answer.hidden = !open;
    }

    faqItems.forEach(function (item) {
      var button = item.querySelector(".faq-question");

      button.addEventListener("click", function () {
        var shouldOpen = button.getAttribute("aria-expanded") !== "true";

        faqItems.forEach(function (otherItem) {
          setFaqItem(otherItem, otherItem === item && shouldOpen);
        });
      });
    });
  }

  /* Accessible contact form validation */
  var form = document.querySelector("[data-contact-form]");

  if (form) {
    var submitButton = form.querySelector("[data-submit-button]");
    var summary = form.querySelector("[data-form-summary]");
    var status = form.querySelector("[data-form-status]");
    var messageField = form.querySelector("#ct-message");
    var counter = form.querySelector("[data-message-counter]");
    var fields = Array.prototype.slice.call(form.querySelectorAll("[data-field]"));
    var fieldLabels = {
      firstName: "first name",
      lastName: "last name",
      email: "email",
      phone: "phone",
      subject: "subject",
      contactMethod: "preferred contact method",
      message: "message",
      consent: "consent"
    };
    var emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    var phonePattern = /^[+\d][\d\s\-()]{5,}$/;

    function fieldTarget(wrapper) {
      if (wrapper.tagName === "FIELDSET") {
        return wrapper;
      }

      return wrapper.querySelector("input, select, textarea");
    }

    function setFieldError(wrapper, message) {
      var errorEl = wrapper.querySelector("[data-error]");
      var target = fieldTarget(wrapper);

      if (target) {
        if (message) {
          target.setAttribute("aria-invalid", "true");
        } else {
          target.removeAttribute("aria-invalid");
        }
      }

      if (errorEl) {
        if (message) {
          errorEl.textContent = message;
          errorEl.hidden = false;
        } else {
          errorEl.textContent = "";
          errorEl.hidden = true;
        }
      }
    }

    function validateField(wrapper) {
      var name = wrapper.dataset.field;
      var message = "";

      if (name === "firstName" || name === "lastName") {
        var nameInput = wrapper.querySelector("input");
        var nameValue = nameInput.value.trim();
        nameInput.value = nameValue;

        if (!nameValue) {
          message = "Please enter your " + (name === "firstName" ? "first" : "last") + " name.";
        } else if (nameValue.length < 2) {
          message = "Please enter at least 2 characters.";
        }
      } else if (name === "email") {
        var emailInput = wrapper.querySelector("input");
        var emailValue = emailInput.value.trim();
        emailInput.value = emailValue;

        if (!emailValue) {
          message = "Please enter your email address.";
        } else if (!emailPattern.test(emailValue)) {
          message = "Please enter a valid email address, like name@example.com.";
        }
      } else if (name === "phone") {
        var phoneInput = wrapper.querySelector("input");
        var phoneValue = phoneInput.value.trim();
        phoneInput.value = phoneValue;

        if (!phoneValue) {
          message = "Please enter a phone number.";
        } else if (!phonePattern.test(phoneValue)) {
          message = "Use digits, spaces, +, - and ( ) only.";
        } else {
          var digits = (phoneValue.match(/\d/g) || []).length;

          if (digits < 7) {
            message = "That phone number looks too short.";
          } else if (digits > 15) {
            message = "That phone number looks too long.";
          }
        }
      } else if (name === "subject") {
        var select = wrapper.querySelector("select");

        if (!select.value) {
          message = "Please choose a subject.";
        }
      } else if (name === "contactMethod") {
        if (!wrapper.querySelector("input:checked")) {
          message = "Please choose how you would like to be contacted.";
        }
      } else if (name === "message") {
        var textarea = wrapper.querySelector("textarea");
        var messageValue = textarea.value.trim();

        if (!messageValue) {
          message = "Please tell us a little about your enquiry.";
        } else if (messageValue.length < 20) {
          message = "Please add a little more detail (at least 20 characters).";
        }
      } else if (name === "consent") {
        var consent = wrapper.querySelector("input[type=\"checkbox\"]");

        if (consent && !consent.checked) {
          message = "Please confirm you agree to be contacted.";
        }
      }

      setFieldError(wrapper, message);
      return message;
    }

    function updateCounter() {
      if (!messageField || !counter) {
        return;
      }

      counter.textContent = messageField.value.length + " / 500 characters";
    }

    fields.forEach(function (wrapper) {
      wrapper.querySelectorAll("input, select, textarea").forEach(function (control) {
        control.addEventListener("blur", function () {
          validateField(wrapper);
        });

        control.addEventListener("change", function () {
          validateField(wrapper);
        });

        control.addEventListener("input", function () {
          if (wrapper.querySelector("[aria-invalid=\"true\"]")) {
            validateField(wrapper);
          }
        });
      });
    });

    if (messageField) {
      messageField.addEventListener("input", updateCounter);
      updateCounter();
    }

    var consentLink = form.querySelector(".ct-check a");
    if (consentLink) {
      consentLink.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var invalidFields = [];

      fields.forEach(function (wrapper) {
        if (validateField(wrapper)) {
          invalidFields.push(wrapper);
        }
      });

      if (invalidFields.length) {
        var names = invalidFields.map(function (wrapper) {
          return fieldLabels[wrapper.dataset.field] || wrapper.dataset.field;
        });

        if (summary) {
          summary.textContent = "Please review the highlighted " + (invalidFields.length === 1 ? "field" : "fields") + " before sending: " + names.join(", ") + ".";
          summary.hidden = false;
        }

        var firstWrapper = invalidFields[0];
        var focusTarget = firstWrapper.tagName === "FIELDSET"
          ? firstWrapper.querySelector("input")
          : firstWrapper.querySelector("input, select, textarea");

        if (focusTarget) {
          focusTarget.focus();
        }

        return;
      }

      if (summary) {
        summary.hidden = true;
        summary.textContent = "";
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      if (status) {
        status.classList.remove("is-success");
        status.textContent = "Sending your message...";
      }

      window.setTimeout(function () {
        form.reset();
        fields.forEach(function (wrapper) {
          setFieldError(wrapper, "");
        });
        updateCounter();

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send message";
        }

        if (status) {
          status.classList.add("is-success");
          status.textContent = "Thank you, we'll get back to you within 24 hours.";
        }
      }, 900);
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
