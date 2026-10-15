(function () {
  "use strict";

  var emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  var namePattern = /^[\p{L}][\p{L}\s'\-]*$/u;
  var cityPattern = /^[\p{L}][\p{L}\s'\-.]*$/u;
  var phonePattern = /^\+?[\d\s\-]+$/;
  var weakPasswords = [
    "password", "12345678", "123456789", "qwerty", "letmein",
    "iloveyou", "admin123", "welcome", "password1", "abc12345", "11111111"
  ];

  function getError(control) {
    var rule = control.getAttribute("data-validate");
    if (!rule) {
      return "";
    }

    var raw = control.value;
    var value = raw.trim();

    if (rule === "name") {
      if (!value) {
        return "Please enter your full name.";
      }
      if (value.length < 2) {
        return "Your name looks too short.";
      }
      if (value.length > 60) {
        return "Please keep your name to 60 characters or fewer.";
      }
      if (!namePattern.test(value)) {
        return "Use letters, spaces, hyphens and apostrophes only.";
      }
      control.value = value;
      return "";
    }

    if (rule === "email") {
      if (!value) {
        return "Please enter your email address.";
      }
      if (!emailPattern.test(value)) {
        return "Enter a valid email like name@example.com.";
      }
      control.value = value.toLowerCase();
      return "";
    }

    if (rule === "phone") {
      if (!value) {
        return control.required ? "Please enter your phone number." : "";
      }
      if (!phonePattern.test(value)) {
        return "Use digits, spaces, + and - only.";
      }

      var digitCount = (value.match(/[0-9]/g) || []).length;

      if (digitCount < 7) {
        return "That phone number looks too short.";
      }
      if (digitCount > 15) {
        return "That phone number looks too long.";
      }
      control.value = value;
      return "";
    }

    if (rule === "city") {
      if (!value) {
        return "Please enter your city of service.";
      }
      if (value.length < 2) {
        return "That city looks too short.";
      }
      if (value.length > 60) {
        return "Please keep this to 60 characters or fewer.";
      }
      if (!cityPattern.test(value)) {
        return "Use letters, spaces, hyphens and apostrophes only.";
      }
      control.value = value;
      return "";
    }

    if (rule === "select") {
      if (!value) {
        return control.getAttribute("data-empty-message") || "Please choose an option.";
      }
      return "";
    }

    if (rule === "password") {
      if (!raw) {
        return "Please create a password.";
      }
      if (raw.length < 8) {
        return "Use at least 8 characters.";
      }
      if (/\s/.test(raw)) {
        return "Passwords cannot contain spaces.";
      }
      if (!/[A-Z]/.test(raw)) {
        return "Add at least one uppercase letter.";
      }
      if (!/[a-z]/.test(raw)) {
        return "Add at least one lowercase letter.";
      }
      if (!/[0-9]/.test(raw)) {
        return "Add at least one number.";
      }
      if (!/[^A-Za-z0-9]/.test(raw)) {
        return "Add at least one special character.";
      }
      if (weakPasswords.indexOf(raw.toLowerCase()) !== -1) {
        return "That password is too common. Please choose another.";
      }
      return "";
    }

    if (rule === "loginPassword") {
      if (!raw) {
        return "Please enter your password.";
      }
      if (!raw.trim()) {
        return "Your password cannot be only spaces.";
      }
      if (raw.length < 8) {
        return "Your password must be at least 8 characters.";
      }
      return "";
    }

    if (rule === "confirm") {
      if (!raw) {
        return "Please confirm your password.";
      }

      var matchSelector = control.getAttribute("data-match");
      var target = matchSelector ? document.querySelector(matchSelector) : null;

      if (target && raw !== target.value) {
        return "Passwords do not match.";
      }
      return "";
    }

    if (rule === "checkbox") {
      if (control.required && !control.checked) {
        return "Please tick this box to continue.";
      }
      return "";
    }

    return "";
  }

  function setError(control, message) {
    var field = control.closest(".auth-field");
    var errorEl = field ? field.querySelector("[data-error]") : null;

    if (message) {
      control.setAttribute("aria-invalid", "true");
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }
    } else {
      control.removeAttribute("aria-invalid");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.hidden = true;
      }
    }
  }

  function isInHiddenRoleGroup(control) {
    var group = control.closest("[data-role-fields]");
    return Boolean(group) && group.hasAttribute("hidden");
  }

  function validateControl(control) {
    if (isInHiddenRoleGroup(control)) {
      setError(control, "");
      return "";
    }

    var message = getError(control);
    setError(control, message);
    return message;
  }

  function passwordScore(value) {
    var score = 0;

    if (value.length >= 8) { score += 1; }
    if (value.length >= 12) { score += 1; }
    if (/[A-Z]/.test(value)) { score += 1; }
    if (/[a-z]/.test(value)) { score += 1; }
    if (/[0-9]/.test(value)) { score += 1; }
    if (/[^A-Za-z0-9]/.test(value)) { score += 1; }

    return score;
  }

  function strengthLevel(value) {
    if (!value) {
      return "";
    }

    var score = passwordScore(value);

    if (score <= 2) {
      return "weak";
    }
    if (score <= 4) {
      return "fair";
    }
    return "strong";
  }

  function updateStrength(control) {
    var field = control.closest(".auth-field");
    var meter = field ? field.querySelector("[data-strength]") : null;

    if (!meter) {
      return;
    }

    var textEl = meter.querySelector("[data-strength-text]");
    var level = strengthLevel(control.value);

    if (!level) {
      meter.removeAttribute("data-level");
      if (textEl) {
        textEl.textContent = "Password strength";
      }
      return;
    }

    meter.setAttribute("data-level", level);
    if (textEl) {
      textEl.textContent = level.charAt(0).toUpperCase() + level.slice(1);
    }
  }

  var toast = document.querySelector("[data-toast]");
  var toastTimer;

  function showToast(message) {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 4500);
  }

  function resolveRole(form) {
    var checked = form.querySelector("input[name=\"role\"]:checked");

    if (checked && (checked.value === "family" || checked.value === "caregiver")) {
      return checked.value;
    }

    try {
      var param = new URLSearchParams(window.location.search).get("role");
      if (param === "family" || param === "caregiver") {
        return param;
      }
    } catch (error) {
      /* ignore */
    }

    return currentRole === "caregiver" ? "caregiver" : "family";
  }

  function persistUser(form) {
    var role = resolveRole(form);

    function valueOf(name) {
      var field = form.querySelector("[name=\"" + name + "\"]");
      return field && typeof field.value === "string" ? field.value.trim() : "";
    }

    var email = valueOf("email").toLowerCase();
    var fullName = valueOf("fullName");
    var existing = null;

    try {
      existing = JSON.parse(window.localStorage.getItem("stackly_user"));
    } catch (error) {
      existing = null;
    }

    if (!fullName && existing && existing.email === email && existing.fullName) {
      fullName = existing.fullName;
    }

    if (!fullName && email) {
      fullName = email.split("@")[0].replace(/[._\-]+/g, " ").replace(/\b\w/g, function (letter) {
        return letter.toUpperCase();
      });
    }

    var user = {
      role: role,
      fullName: fullName,
      email: email,
      phone: valueOf("phone"),
      relationship: valueOf("relationship"),
      careType: valueOf("careType"),
      expertise: valueOf("expertise"),
      experience: valueOf("experience"),
      city: valueOf("city"),
      rememberMe: Boolean(form.querySelector("input[name=\"remember\"]:checked")),
      createdAt: (existing && existing.createdAt) ? existing.createdAt : new Date().toISOString()
    };

    try {
      window.localStorage.setItem("stackly_user", JSON.stringify(user));
    } catch (error) {
      /* storage unavailable */
    }

    return user;
  }

  /* Role selection (Family / Care Seeker <-> Caregiver) */
  var roleInputs = Array.prototype.slice.call(document.querySelectorAll(".auth-role__input"));
  var roleGroups = Array.prototype.slice.call(document.querySelectorAll("[data-role-fields]"));
  var storyGroups = Array.prototype.slice.call(document.querySelectorAll("[data-role-story]"));
  var copyNodes = Array.prototype.slice.call(document.querySelectorAll("[data-copy-family]"));
  var roleLinks = Array.prototype.slice.call(document.querySelectorAll("[data-role-link]"));
  var formSummaries = Array.prototype.slice.call(document.querySelectorAll("[data-form-summary]"));
  var currentRole = "family";

  function updateUrl(role) {
    if (!window.history || !window.history.replaceState) {
      return;
    }

    try {
      var url = new URL(window.location.href);
      url.searchParams.set("role", role);
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    } catch (error) {
      /* ignore */
    }
  }

  function setRole(role) {
    currentRole = role === "caregiver" ? "caregiver" : "family";

    roleInputs.forEach(function (input) {
      input.checked = input.value === currentRole;
    });

    roleGroups.forEach(function (group) {
      var isMatch = group.getAttribute("data-role-fields") === currentRole;
      group.hidden = !isMatch;

      if (!isMatch) {
        group.querySelectorAll("[data-validate]").forEach(function (control) {
          setError(control, "");
        });
      }
    });

    storyGroups.forEach(function (group) {
      group.hidden = group.getAttribute("data-role-story") !== currentRole;
    });

    copyNodes.forEach(function (element) {
      var text = element.getAttribute("data-copy-" + currentRole);
      if (text !== null) {
        element.textContent = text;
      }
    });

    roleLinks.forEach(function (link) {
      var base = link.getAttribute("data-base");
      if (base) {
        link.href = base + "?role=" + currentRole;
      }
    });

    formSummaries.forEach(function (summary) {
      summary.hidden = true;
      summary.textContent = "";
    });

    updateUrl(currentRole);
  }

  roleInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      if (input.checked) {
        setRole(input.value);
      }
    });
  });

  var initialRole = "family";

  try {
    if (new URLSearchParams(window.location.search).get("role") === "caregiver") {
      initialRole = "caregiver";
    }
  } catch (error) {
    /* ignore */
  }

  setRole(initialRole);

  /* Password show / hide toggles */
  document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var targetId = button.getAttribute("aria-controls");
      var input = targetId ? document.getElementById(targetId) : null;

      if (!input) {
        return;
      }

      var isPressed = button.getAttribute("aria-pressed") === "true";
      var show = !isPressed;

      input.type = show ? "text" : "password";
      button.setAttribute("aria-pressed", String(show));
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");

      var textEl = button.querySelector("[data-toggle-text]");
      if (textEl) {
        textEl.textContent = show ? "Hide" : "Show";
      }
    });
  });

  /* Forms */
  document.querySelectorAll("[data-auth-form]").forEach(function (form) {
    var submit = form.querySelector("[data-submit]");
    var summary = form.querySelector("[data-form-summary]");
    var status = form.querySelector("[data-form-status]");
    var controls = Array.prototype.slice.call(form.querySelectorAll("[data-validate]"));
    var passwordControl = form.querySelector("[data-validate=\"password\"]");
    var confirmControl = form.querySelector("[data-validate=\"confirm\"]");

    function revalidateConfirm() {
      if (confirmControl && (confirmControl.value || confirmControl.getAttribute("aria-invalid") === "true")) {
        validateControl(confirmControl);
      }
    }

    controls.forEach(function (control) {
      control.addEventListener("blur", function () {
        validateControl(control);
      });

      control.addEventListener("change", function () {
        validateControl(control);

        if (control === passwordControl) {
          updateStrength(control);
          revalidateConfirm();
        }
      });

      control.addEventListener("input", function () {
        if (control.getAttribute("aria-invalid") === "true") {
          validateControl(control);
        }

        if (control === passwordControl) {
          updateStrength(control);
          revalidateConfirm();
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var invalidControls = [];

      controls.forEach(function (control) {
        if (validateControl(control)) {
          invalidControls.push(control);
        }
      });

      if (invalidControls.length) {
        var labels = invalidControls.map(function (control) {
          return control.getAttribute("data-label") || control.name;
        });

        if (summary) {
          summary.textContent = "Please fix the " + (invalidControls.length === 1 ? "field" : "fields") + " highlighted below: " + labels.join(", ") + ".";
          summary.hidden = false;
        }

        invalidControls[0].focus();
        return;
      }

      if (summary) {
        summary.hidden = true;
        summary.textContent = "";
      }

      var originalLabel = submit ? submit.textContent : "";
      var processingLabel = form.getAttribute("data-processing-label") || "Please wait...";
      var processingMessage = form.getAttribute("data-processing-message") || "One moment...";
      var successMessage = form.getAttribute("data-success-message") || "Success. Redirecting...";
      var redirect = form.getAttribute("data-success-redirect") || "index.html";
      var savedUser = persistUser(form);
      var targetRole = (savedUser && savedUser.role === "caregiver") ? "caregiver" : "family";
      redirect = targetRole === "caregiver" ? "dashboard-caregiver.html" : "dashboard-family.html";

      if (submit) {
        submit.disabled = true;
        submit.textContent = processingLabel;
      }

      if (status) {
        status.classList.remove("is-success");
        status.textContent = processingMessage;
      }

      window.setTimeout(function () {
        form.reset();
        setRole(currentRole);

        controls.forEach(function (control) {
          setError(control, "");
        });

        var strength = form.querySelector("[data-strength]");
        if (strength) {
          strength.removeAttribute("data-level");
        }

        var strengthText = form.querySelector("[data-strength-text]");
        if (strengthText) {
          strengthText.textContent = "Password strength";
        }

        if (submit) {
          submit.disabled = false;
          submit.textContent = originalLabel;
        }

        if (status) {
          status.classList.add("is-success");
          status.textContent = successMessage;
        }

        showToast(successMessage);

        window.setTimeout(function () {
          window.location.href = redirect;
        }, 1200);
      }, 900);
    });
  });
})();
