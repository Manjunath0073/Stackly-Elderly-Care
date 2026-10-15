(function () {
  "use strict";

  var redirectTarget = "404.html";
  var exemptSelector = [
    "[data-header]",
    ".ds-topbar",
    ".site-footer",
    ".ds-footer",
    ".auth-header",
    ".auth-footer",
    ".ds-sidebar .ds-brand",
    ".ds-sidebar [data-ds-collapse]",
    ".ds-sidebar [data-ds-nav]",
    ".ds-sidebar [data-ds-view-link]",
    "[data-allow-navigation]",
    "[data-slider-prev]",
    "[data-slider-next]",
    "[data-newsletter-form]",
    "[data-contact-form]"
  ].join(", ");

  function isExempt(element) {
    return Boolean(element && element.closest(exemptSelector));
  }

  function redirect(event) {
    var target = event.target && event.target.closest
      ? event.target.closest("a, button")
      : null;

    if (!target || isExempt(target)) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = redirectTarget;
  }

  document.addEventListener("click", redirect, true);

  document.addEventListener("submit", function (event) {
    var form = event.target;

    if (!form || isExempt(form)) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = redirectTarget;
  }, true);
})();
