(function () {
  "use strict";

  var STORAGE_KEY = "stackly_user";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COLORS = {
    teal: "#1d716b",
    tealDark: "#155650",
    sage: "#a8c6b7",
    gold: "#d9aa5e",
    coral: "#df7f62",
    ink: "#10302f",
    slate: "#536665",
    line: "#d8e2dc"
  };

  function readUser() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  function writeUser(next) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      /* storage unavailable */
    }
  }

  var user = readUser();

  if (!user || user.role !== "caregiver") {
    window.location.replace("login.html");
    return;
  }

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
    });
  }

  function initials(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return "C";
    }
    return (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : "")).toUpperCase();
  }

  function firstName(name) {
    return String(name || "").trim().split(/\s+/)[0] || "there";
  }

  var EXPERTISE_LABELS = {
    nursing: "Nursing",
    "personal-care": "Personal care",
    companionship: "Companionship",
    "memory-care": "Memory care",
    respite: "Respite care"
  };

  function expertiseLabel(value) {
    return EXPERTISE_LABELS[value] || value || "Not set";
  }

  var EXPERIENCE_LABELS = {
    "0-1": "Less than 1 year",
    "1-3": "1 to 3 years",
    "3-5": "3 to 5 years",
    "5-10": "5 to 10 years",
    "10-plus": "10+ years"
  };

  function experienceLabel(value) {
    return EXPERIENCE_LABELS[value] || value || "Not set";
  }

  /* ------------------------------------------------------------------ data */

  var today = new Date();
  var DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  var DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  var weeklyHours = [
    { label: "Mon", value: 6 },
    { label: "Tue", value: 5 },
    { label: "Wed", value: 7 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 6 },
    { label: "Sat", value: 3 },
    { label: "Sun", value: 2 }
  ];

  var earnings = [
    { label: "May", value: 2400 },
    { label: "Jun", value: 2650 },
    { label: "Jul", value: 2900 },
    { label: "Aug", value: 2750 },
    { label: "Sep", value: 3100 },
    { label: "Oct", value: 3250 }
  ];

  var visitMix = [
    { key: "teal", label: "Nursing", value: 14, color: COLORS.teal },
    { key: "sage", label: "Personal care", value: 11, color: COLORS.sage },
    { key: "gold", label: "Companionship", value: 9, color: COLORS.gold },
    { key: "coral", label: "Memory care", value: 6, color: COLORS.coral }
  ];

  var clients = [
    { name: "Margaret Doyle", avatar: "images/avatar-sara.webp", careType: "Home nursing", schedule: "Mon, Wed, Fri · 9:00 AM", status: "Active" },
    { name: "Thomas Nguyen", avatar: "images/avatar-robert.webp", careType: "Personal care", schedule: "Tue, Thu · 2:00 PM", status: "Active" },
    { name: "Grace Okafor", avatar: "images/avatar-amira.webp", careType: "Companionship", schedule: "Sat · 11:00 AM", status: "Paused" }
  ];

  var todayVisits = [
    { client: clients[0], time: "9:00 AM", service: "Home nursing visit", status: "Confirmed" },
    { client: clients[1], time: "2:00 PM", service: "Personal care", status: "Confirmed" },
    { client: clients[0], time: "5:30 PM", service: "Medication check", status: "Pending" }
  ];

  var reviews = [
    { client: clients[0], stars: 5, text: "Kind, punctual and so gentle with my mother. We are grateful.", time: "2 days ago" },
    { client: clients[1], stars: 5, text: "Explains everything clearly and never rushes. A real professional.", time: "1 week ago" },
    { client: clients[2], stars: 4, text: "Warm and dependable — my grandmother looks forward to every visit.", time: "2 weeks ago" }
  ];

  var ratingAverage = 4.8;

  var tasks = [
    { label: "Submit September timesheet", meta: "Due today", done: false },
    { label: "Confirm Thursday visit with Margaret", meta: "Due tomorrow", done: false },
    { label: "Update medication notes for Thomas", meta: "Due Friday", done: true },
    { label: "Renew CPR certification", meta: "Due in 2 weeks", done: false }
  ];

  var notes = [
    { text: "Margaret had a calm morning — ate a full breakfast and walked to the garden.", time: "Today · 9:45 AM" },
    { text: "Thomas reported mild knee discomfort; logged it and suggested a rest day.", time: "Yesterday · 3:10 PM" },
    { text: "Grace enjoyed the music session — sang along to her favourite songs.", time: "2 days ago · 11:30 AM" }
  ];

  var messages = [
    { avatar: "images/avatar-sara.webp", name: "Margaret's family", text: "Could we add a fourth morning visit next week?", time: "20 minutes ago" },
    { avatar: "images/avatar-robert.webp", name: "Thomas Nguyen", text: "Thanks for the notes — very helpful. See you Thursday.", time: "3 hours ago" },
    { avatar: "images/avatar-amira.webp", name: "Grace's family", text: "Grace loved the music session. Same time next week?", time: "Yesterday" },
    { avatar: "images/caregiver-elena.webp", name: "Stackly Care Team", text: "New visit request matched to your profile — review when free.", time: "2 days ago" }
  ];

  var defaultAvailability = (function () {
    var slots = {};
    DAY_KEYS.forEach(function (day, index) {
      ["am", "pm"].forEach(function (part) {
        slots[day + "-" + part] = index < 5;
      });
    });
    return slots;
  })();

  function availability() {
    if (user.availability && typeof user.availability === "object") {
      return user.availability;
    }
    return defaultAvailability;
  }

  var kpis = [
    {
      label: "Today's visits",
      value: String(todayVisits.length),
      trend: { dir: "up", text: "+1 vs yesterday" },
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15\" rx=\"2.5\"/><path d=\"M3.5 9.5h17M8 3.5v3M16 3.5v3\"/></svg>"
    },
    {
      label: "Hours this week",
      value: weeklyHours.reduce(function (sum, day) { return sum + day.value; }, 0) + " h",
      trend: { dir: "up", text: "+8% vs last week" },
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7.5V12l3 2\"/></svg>"
    },
    {
      label: "Monthly earnings",
      value: "$" + earnings[earnings.length - 1].value.toLocaleString("en-US"),
      trend: { dir: "up", text: "+5% vs last month" },
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v10M14.5 9.2A2.6 2.6 0 0 0 12 8c-1.4 0-2.5.8-2.5 2s1.1 2 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2a2.6 2.6 0 0 1-2.5-1.2\"/></svg>"
    },
    {
      label: "Average rating",
      value: ratingAverage.toFixed(1) + " / 5",
      trend: { dir: "up", text: "+0.1 this month" },
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z\"/></svg>"
    }
  ];

  /* --------------------------------------------------------- header & profile */

  function greeting() {
    var hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    }
    if (hour < 18) {
      return "Good afternoon";
    }
    return "Good evening";
  }

  function populateHeader() {
    var name = user.fullName || "Caregiver";
    var greetingEl = $("[data-ds-greeting]");
    if (greetingEl) {
      greetingEl.textContent = greeting() + ", " + firstName(name) + ".";
    }

    var dateEl = $("[data-ds-dateline]");
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }

    var summaryEl = $("[data-ds-summary]");
    if (summaryEl) {
      var hours = weeklyHours.reduce(function (sum, day) { return sum + day.value; }, 0);
      summaryEl.textContent = "You have " + todayVisits.length + " visits scheduled today and " + hours + " care hours logged this week.";
    }

    var usernameEl = $("[data-ds-username]");
    if (usernameEl) {
      usernameEl.textContent = name;
    }

    var roleEl = $("[data-ds-role]");
    if (roleEl) {
      roleEl.textContent = expertiseLabel(user.expertise);
    }

    var avatar = $("[data-ds-avatar]");
    if (avatar) {
      if (user.avatar) {
        avatar.innerHTML = "<img src=\"" + esc(user.avatar) + "\" width=\"96\" height=\"96\" alt=\"\">";
      } else {
        avatar.textContent = initials(name);
      }
    }

    var chips = $("[data-ds-chips]");
    if (chips) {
      chips.innerHTML =
        "<li><strong>" + esc(expertiseLabel(user.expertise)) + "</strong> expertise</li>" +
        "<li><strong>" + esc(experienceLabel(user.experience)) + "</strong> experience</li>" +
        "<li><strong>" + esc(user.city || "City not set") + "</strong> service area</li>" +
        "<li><strong>" + esc(user.email || "—") + "</strong></li>";
    }
  }

  function profileFields() {
    return [user.fullName, user.email, user.phone, user.expertise, user.experience, user.city];
  }

  function completeness() {
    var filled = profileFields().filter(function (value) { return value && String(value).trim(); }).length;
    var total = profileFields().length + 1;
    var hasAvailability = Object.keys(availability()).some(function (key) { return availability()[key]; });
    if (hasAvailability) {
      filled += 1;
    }
    return Math.round((filled / total) * 100);
  }

  function populateProfileView() {
    var view = $("[data-ds-profile-view]");
    if (!view) {
      return;
    }

    var rows = [
      ["Full name", user.fullName || "—"],
      ["Email", user.email || "—"],
      ["Phone", user.phone || "—"],
      ["Expertise", expertiseLabel(user.expertise)],
      ["Experience", experienceLabel(user.experience)],
      ["City of service", user.city || "—"],
      ["Member since", user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"]
    ];

    view.innerHTML = rows.map(function (row) {
      return "<div class=\"ds-profile__row\"><dt class=\"ds-profile__label\">" + esc(row[0]) + "</dt><dd class=\"ds-profile__value\">" + esc(row[1]) + "</dd></div>";
    }).join("");
  }

  /* ------------------------------------------------------------------ charts */

  var tip = null;

  function showTip(html, target) {
    if (!tip) {
      return;
    }
    tip.innerHTML = html;
    tip.hidden = false;

    var rect = target.getBoundingClientRect();
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var left = rect.left + rect.width / 2 - tw / 2;
    var top = rect.top - th - 10;

    if (top < 8) {
      top = rect.bottom + 10;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    tip.style.left = Math.round(left) + "px";
    tip.style.top = Math.round(top) + "px";
  }

  function hideTip() {
    if (tip) {
      tip.hidden = true;
    }
  }

  function bindTips(root) {
    $$("[data-tip]", root).forEach(function (node) {
      node.addEventListener("mouseenter", function () { showTip(node.getAttribute("data-tip"), node); });
      node.addEventListener("focus", function () { showTip(node.getAttribute("data-tip"), node); });
      node.addEventListener("mouseleave", hideTip);
      node.addEventListener("blur", hideTip);
    });
  }

  function fillTable(selector, rows) {
    var table = document.querySelector(selector);
    if (!table) {
      return;
    }
    var tbody = table.querySelector("tbody");
    if (!tbody) {
      return;
    }
    tbody.innerHTML = rows.map(function (row) {
      return "<tr>" + row.map(function (cell) { return "<td>" + esc(cell) + "</td>"; }).join("") + "</tr>";
    }).join("");
  }

  function chartWidth(container) {
    var width = container.clientWidth || container.parentElement.clientWidth || 320;
    return Math.max(280, Math.round(width));
  }

  function smoothPath(xs, ys) {
    var d = "M " + xs[0] + " " + ys[0];
    for (var i = 0; i < xs.length - 1; i += 1) {
      var x0 = i > 0 ? xs[i - 1] : xs[i];
      var y0 = i > 0 ? ys[i - 1] : ys[i];
      var x1 = xs[i];
      var y1 = ys[i];
      var x2 = xs[i + 1];
      var y2 = ys[i + 1];
      var x3 = i + 2 < xs.length ? xs[i + 2] : x2;
      var y3 = i + 2 < ys.length ? ys[i + 2] : y2;
      var c1x = x1 + (x2 - x0) / 6;
      var c1y = y1 + (y2 - y0) / 6;
      var c2x = x2 - (x3 - x1) / 6;
      var c2y = y2 - (y3 - y1) / 6;
      d += " C " + c1x.toFixed(1) + " " + c1y.toFixed(1) + ", " + c2x.toFixed(1) + " " + c2y.toFixed(1) + ", " + x2 + " " + y2;
    }
    return d;
  }

  function niceMax(max, step) {
    return Math.ceil(max / step) * step;
  }

  function buildBarChart(container, tableSelector, data) {
    var W = chartWidth(container);
    var H = 260;
    var padL = 42;
    var padR = 14;
    var padT = 16;
    var padB = 42;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }));
    var top = niceMax(max, 2);
    var n = data.length;
    var slot = plotW / n;
    var barW = Math.min(40, slot * 0.52);
    var parts = [];

    parts.push("<svg viewBox=\"0 0 " + W + " " + H + "\" role=\"img\" aria-label=\"Bar chart of care hours per day this week.\" preserveAspectRatio=\"xMidYMid meet\">");

    for (var g = 0; g <= 4; g += 1) {
      var y = padT + plotH * (g / 4);
      var value = Math.round(top * (1 - g / 4));
      parts.push("<line class=\"ds-grid-line\" x1=\"" + padL + "\" y1=\"" + y + "\" x2=\"" + (padL + plotW) + "\" y2=\"" + y + "\"/>");
      parts.push("<text class=\"ds-axis-label\" x=\"" + (padL - 8) + "\" y=\"" + (y + 4) + "\" text-anchor=\"end\">" + value + "</text>");
    }

    data.forEach(function (d, index) {
      var h = plotH * (d.value / top);
      var x = padL + slot * index + (slot - barW) / 2;
      var y = padT + plotH - h;
      parts.push("<rect class=\"ds-bar\" x=\"" + x.toFixed(1) + "\" y=\"" + y.toFixed(1) + "\" width=\"" + barW.toFixed(1) + "\" height=\"" + h.toFixed(1) + "\" rx=\"6\" tabindex=\"0\" data-tip=\"" + esc(d.label + " · " + d.value + " care hours") + "\" aria-label=\"" + esc(d.label + ": " + d.value + " care hours") + "\"/>");
      parts.push("<text class=\"ds-axis-label\" x=\"" + (padL + slot * index + slot / 2).toFixed(1) + "\" y=\"" + (H - 16) + "\" text-anchor=\"middle\">" + esc(d.label) + "</text>");
    });

    parts.push("</svg>");
    container.innerHTML = parts.join("");
    bindTips(container);
    fillTable(tableSelector, data.map(function (d) { return [d.label, d.value + " h"]; }));

    window.requestAnimationFrame(function () { container.classList.add("is-ready"); });
  }

  function buildAreaChart(container, tableSelector, data, opts) {
    opts = opts || {};
    var W = chartWidth(container);
    var H = 260;
    var padL = 56;
    var padR = 14;
    var padT = 18;
    var padB = 40;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }));
    var top = niceMax(max, 500);
    var n = data.length;
    var xs = data.map(function (d, i) { return Math.round(padL + (n > 1 ? plotW * (i / (n - 1)) : plotW / 2)); });
    var ys = data.map(function (d) { return Math.round(padT + plotH * (1 - d.value / top)); });
    var line = smoothPath(xs, ys);
    var area = line + " L " + xs[n - 1] + " " + (padT + plotH) + " L " + xs[0] + " " + (padT + plotH) + " Z";
    var gradId = "cgGrad-" + Math.random().toString(36).slice(2, 7);
    var parts = [];

    parts.push("<svg viewBox=\"0 0 " + W + " " + H + "\" role=\"img\" aria-label=\"" + esc(opts.label || "Area chart") + "\" preserveAspectRatio=\"xMidYMid meet\">");
    parts.push("<defs><linearGradient id=\"" + gradId + "\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"" + COLORS.teal + "\" stop-opacity=\"0.28\"/><stop offset=\"100%\" stop-color=\"" + COLORS.teal + "\" stop-opacity=\"0\"/></linearGradient></defs>");

    for (var g = 0; g <= 4; g += 1) {
      var gy = padT + plotH * (g / 4);
      var gv = Math.round(top * (1 - g / 4));
      parts.push("<line class=\"ds-grid-line\" x1=\"" + padL + "\" y1=\"" + gy + "\" x2=\"" + (padL + plotW) + "\" y2=\"" + gy + "\"/>");
      parts.push("<text class=\"ds-axis-label\" x=\"" + (padL - 8) + "\" y=\"" + (gy + 4) + "\" text-anchor=\"end\">$" + gv.toLocaleString("en-US") + "</text>");
    }

    parts.push("<path class=\"ds-area-fill\" d=\"" + area + "\" fill=\"url(#" + gradId + ")\"/>");
    parts.push("<path class=\"ds-area-line\" d=\"" + line + "\"/>");

    data.forEach(function (d, index) {
      parts.push("<text class=\"ds-axis-label\" x=\"" + xs[index] + "\" y=\"" + (H - 14) + "\" text-anchor=\"middle\">" + esc(d.label) + "</text>");
      parts.push("<circle class=\"ds-point\" cx=\"" + xs[index] + "\" cy=\"" + ys[index] + "\" r=\"4\" tabindex=\"0\" data-tip=\"" + esc(d.label + " · $" + d.value.toLocaleString("en-US")) + "\" aria-label=\"" + esc(d.label + ": $" + d.value.toLocaleString("en-US")) + "\"/>");
    });

    parts.push("</svg>");
    container.innerHTML = parts.join("");
    bindTips(container);
    fillTable(tableSelector, data.map(function (d) { return [d.label, "$" + d.value.toLocaleString("en-US")]; }));

    window.requestAnimationFrame(function () { container.classList.add("is-ready"); });
  }

  function buildDonutChart(container, tableSelector, segments) {
    var total = segments.reduce(function (sum, d) { return sum + d.value; }, 0);
    var size = Math.min(220, Math.max(168, container.clientWidth || 200));
    var strokeW = 24;
    var r = (size - strokeW) / 2;
    var cx = size / 2;
    var cy = size / 2;
    var circumference = 2 * Math.PI * r;
    var offset = 0;
    var parts = [];

    parts.push("<svg viewBox=\"0 0 " + size + " " + size + "\" role=\"img\" aria-label=\"Donut chart of visits by care type this month.\" preserveAspectRatio=\"xMidYMid meet\">");
    parts.push("<g transform=\"rotate(-90 " + cx + " " + cy + ")\">");
    segments.forEach(function (segment) {
      var length = circumference * (segment.value / total);
      parts.push("<circle class=\"ds-seg\" cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"" + r + "\" stroke=\"" + segment.color + "\" stroke-dasharray=\"0 " + circumference.toFixed(2) + "\" stroke-dashoffset=\"" + (-offset).toFixed(2) + "\" data-len=\"" + length.toFixed(2) + "\" data-c=\"" + circumference.toFixed(2) + "\" tabindex=\"0\" data-tip=\"" + esc(segment.label + " · " + segment.value + " visits (" + Math.round((segment.value / total) * 100) + "%)") + "\" aria-label=\"" + esc(segment.label + ": " + segment.value + " visits") + "\"/>");
      offset += length;
    });
    parts.push("</g>");
    parts.push("<text class=\"ds-donut-total\" x=\"" + cx + "\" y=\"" + (cy - 1) + "\" text-anchor=\"middle\">" + total + "</text>");
    parts.push("<text class=\"ds-donut-sub\" x=\"" + cx + "\" y=\"" + (cy + 18) + "\" text-anchor=\"middle\">VISITS</text>");
    parts.push("</svg>");

    parts.push("<ul class=\"ds-chart-legend\">");
    segments.forEach(function (segment) {
      parts.push("<li><span class=\"ds-chart-legend__swatch ds-chart-legend__swatch--" + segment.key + "\"></span>" + esc(segment.label) + "<strong>" + Math.round((segment.value / total) * 100) + "%</strong></li>");
    });
    parts.push("</ul>");

    container.innerHTML = parts.join("");
    bindTips(container);
    fillTable(tableSelector, segments.map(function (segment) {
      return [segment.label, segment.value, Math.round((segment.value / total) * 100) + "%"];
    }));

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        $$(".ds-seg", container).forEach(function (seg) {
          seg.setAttribute("stroke-dasharray", seg.getAttribute("data-len") + " " + seg.getAttribute("data-c"));
        });
      });
    });
  }

  function buildGauge(container, value, max) {
    if (!container) {
      return;
    }
    var size = 180;
    var strokeW = 16;
    var r = (size - strokeW) / 2;
    var cx = size / 2;
    var cy = size / 2;
    var circumference = 2 * Math.PI * r;
    var arc = circumference * (value / max);
    var parts = [];

    parts.push("<svg viewBox=\"0 0 " + size + " " + size + "\" role=\"img\" aria-label=\"Average rating " + value + " out of " + max + ".\">");
    parts.push("<circle class=\"ds-gauge__track\" cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"" + r + "\" stroke-width=\"" + strokeW + "\"/>");
    parts.push("<g transform=\"rotate(-90 " + cx + " " + cy + ")\"><circle class=\"ds-gauge__arc\" cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"" + r + "\" stroke-width=\"" + strokeW + "\" stroke-dasharray=\"0 " + circumference.toFixed(2) + "\" data-len=\"" + arc.toFixed(2) + "\" data-c=\"" + circumference.toFixed(2) + "\"/></g>");
    parts.push("<text class=\"ds-gauge__value\" x=\"" + cx + "\" y=\"" + (cy + 4) + "\" text-anchor=\"middle\">" + value.toFixed(1) + "</text>");
    parts.push("<text class=\"ds-gauge__sub\" x=\"" + cx + "\" y=\"" + (cy + 24) + "\" text-anchor=\"middle\">OUT OF " + max + "</text>");
    parts.push("</svg>");

    container.innerHTML = parts.join("");

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        var arcEl = $(".ds-gauge__arc", container);
        if (arcEl) {
          arcEl.setAttribute("stroke-dasharray", arcEl.getAttribute("data-len") + " " + arcEl.getAttribute("data-c"));
        }
      });
    });
  }

  function buildChartsIn(root) {
    if (!root) {
      return;
    }
    var hoursContainer = root.querySelector("[data-chart=\"weekly-hours\"]");
    var earningsContainer = root.querySelector("[data-chart=\"earnings\"]");
    var mixContainer = root.querySelector("[data-chart=\"visit-mix\"]");
    var gaugeContainer = root.querySelector("[data-gauge]");

    if (hoursContainer) {
      buildBarChart(hoursContainer, "[data-table=\"weekly-hours\"]", weeklyHours);
    }
    if (earningsContainer) {
      buildAreaChart(earningsContainer, "[data-table=\"earnings\"]", earnings, { label: "Area chart of monthly earnings over the last 6 months." });
    }
    if (mixContainer) {
      buildDonutChart(mixContainer, "[data-table=\"visit-mix\"]", visitMix);
    }
    if (gaugeContainer) {
      buildGauge(gaugeContainer, ratingAverage, 5);
    }
  }

  /* ------------------------------------------------------------------ render */

  function renderKpis() {
    var wrap = $("[data-ds-kpis]");
    if (!wrap) {
      return;
    }

    wrap.innerHTML = kpis.map(function (kpi) {
      var dirClass = kpi.trend.dir === "down" ? "ds-kpi__trend--down" : "ds-kpi__trend--up";
      var arrow = kpi.trend.dir === "down" ? "&#9660;" : "&#9650;";
      return "<article class=\"ds-kpi\">" +
        "<div class=\"ds-kpi__top\"><span class=\"ds-kpi__icon\" aria-hidden=\"true\">" + kpi.icon + "</span>" +
        "<span class=\"ds-kpi__trend " + dirClass + "\">" + arrow + " " + esc(kpi.trend.text) + "</span></div>" +
        "<p class=\"ds-kpi__value\">" + esc(kpi.value) + "</p>" +
        "<p class=\"ds-kpi__label\">" + esc(kpi.label) + "</p>" +
        "</article>";
    }).join("");
  }

  function renderTodayVisits() {
    var list = $("[data-today-visits]");
    var dateEl = $("[data-cg-today-date]");
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    }
    if (!list) {
      return;
    }

    list.innerHTML = todayVisits.map(function (visit) {
      var statusClass = visit.status === "Pending" ? "ds-status--pending" : "ds-status--confirmed";
      var search = (visit.client.name + " " + visit.service + " " + visit.status).toLowerCase();
      return "<li class=\"ds-list__item\" data-search=\"" + esc(search) + "\">" +
        "<span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(visit.client.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(visit.service) + "</strong><span>" + esc(visit.client.name) + " &middot; " + esc(visit.time) + "</span></span>" +
        "<span class=\"ds-status " + statusClass + "\">" + esc(visit.status) + "</span>" +
        "</li>";
    }).join("");
  }

  function renderClients() {
    var list = $("[data-clients]");
    if (!list) {
      return;
    }

    list.innerHTML = clients.map(function (client) {
      var statusClass = client.status === "Paused" ? "ds-status--pending" : "ds-status--confirmed";
      var search = (client.name + " " + client.careType + " " + client.status).toLowerCase();
      return "<li class=\"ds-list__item\" data-search=\"" + esc(search) + "\">" +
        "<span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(client.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(client.name) + "</strong><span>" + esc(client.careType) + " &middot; " + esc(client.schedule) + "</span></span>" +
        "<span class=\"ds-status " + statusClass + "\">" + esc(client.status) + "</span>" +
        "</li>";
    }).join("");
  }

  function renderReviews() {
    var feed = $("[data-reviews]");
    if (!feed) {
      return;
    }

    feed.innerHTML = reviews.map(function (review) {
      var stars = "";
      for (var i = 0; i < 5; i += 1) {
        stars += i < review.stars ? "&#9733;" : "&#9734;";
      }
      return "<li class=\"ds-feed__item\">" +
        "<span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(review.client.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-feed__body\"><p><strong>" + esc(review.client.name) + "</strong> <span class=\"ds-stars\" aria-label=\"" + review.stars + " out of 5 stars\">" + stars + "</span></p>" +
        "<p>&ldquo;" + esc(review.text) + "&rdquo;</p><span class=\"ds-feed__time\">" + esc(review.time) + "</span></span></li>";
    }).join("");
  }

  function renderMessages() {
    var feed = $("[data-messages]");
    if (!feed) {
      return;
    }

    feed.innerHTML = messages.map(function (message) {
      var search = (message.name + " " + message.text).toLowerCase();
      return "<li class=\"ds-feed__item\" data-search=\"" + esc(search) + "\">" +
        "<span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(message.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-feed__body\"><p><strong>" + esc(message.name) + "</strong> " + esc(message.text) + "</p><span class=\"ds-feed__time\">" + esc(message.time) + "</span></span>" +
        "</li>";
    }).join("");
  }

  function renderTasks() {
    var list = $("[data-tasks]");
    var count = $("[data-tasks-count]");
    if (!list) {
      return;
    }

    list.innerHTML = tasks.map(function (task, index) {
      return "<li class=\"cg-task\">" +
        "<input type=\"checkbox\" id=\"cg-task-" + index + "\"" + (task.done ? " checked" : "") + ">" +
        "<span class=\"cg-task__body\"><label class=\"cg-task__label\" for=\"cg-task-" + index + "\">" + esc(task.label) + "</label>" +
        "<span class=\"cg-task__meta\">" + esc(task.meta) + "</span></span></li>";
    }).join("");

    if (count) {
      var pending = tasks.filter(function (task) { return !task.done; }).length;
      count.textContent = pending + " pending";
    }
  }

  function renderNotes() {
    var wrap = $("[data-notes]");
    if (!wrap) {
      return;
    }
    wrap.innerHTML = notes.map(function (note) {
      return "<article class=\"cg-note\"><p>" + esc(note.text) + "</p><span class=\"cg-note__time\">" + esc(note.time) + "</span></article>";
    }).join("");
  }

  function renderAvailability() {
    var wrap = $("[data-availability]");
    if (!wrap) {
      return;
    }

    var slots = availability();
    var parts = ["<div class=\"cg-avail__grid\">"];
    parts.push("<span class=\"cg-avail__corner\" aria-hidden=\"true\"></span>");
    DAY_SHORT.forEach(function (day) {
      parts.push("<span class=\"cg-avail__day\">" + day + "</span>");
    });
    [["am", "AM"], ["pm", "PM"]].forEach(function (part) {
      parts.push("<span class=\"cg-avail__slot\">" + part[1] + "</span>");
      DAY_KEYS.forEach(function (day, index) {
        var key = day + "-" + part[0];
        var on = Boolean(slots[key]);
        parts.push("<button class=\"cg-avail__cell\" type=\"button\" aria-pressed=\"" + on + "\" data-slot=\"" + key + "\" aria-label=\"" + DAY_SHORT[index] + " " + (part[0] === "am" ? "morning" : "afternoon") + (on ? ", available" : ", unavailable") + "\"></button>");
      });
    });
    parts.push("</div>");

    wrap.innerHTML = parts.join("");

    $$(".cg-avail__cell", wrap).forEach(function (cell) {
      cell.addEventListener("click", function () {
        var on = cell.getAttribute("aria-pressed") !== "true";
        cell.setAttribute("aria-pressed", String(on));

        var slot = cell.getAttribute("data-slot");
        var slotParts = slot.split("-");
        var dayIndex = DAY_KEYS.indexOf(slotParts[0]);
        var partName = slotParts[1] === "am" ? "morning" : "afternoon";
        cell.setAttribute("aria-label", DAY_SHORT[dayIndex] + " " + partName + (on ? ", available" : ", unavailable"));

        var current = availability();
        current[slot] = on;
        user.availability = current;
        writeUser(user);

        updateAvailabilityMeta();
        renderCompleteness();
      });
    });

    updateAvailabilityMeta();
  }

  function updateAvailabilityMeta() {
    var slots = availability();
    var available = Object.keys(slots).filter(function (key) { return slots[key]; }).length;
    var countEl = $("[data-avail-count]");
    if (countEl) {
      countEl.textContent = available + " / 14";
    }
    var statusEl = $("[data-avail-status]");
    if (statusEl) {
      statusEl.textContent = "Availability saved.";
    }
  }

  function renderCompleteness() {
    var pct = completeness();
    var valueEl = $("[data-completeness-value]");
    var fill = $("[data-completeness-fill]");
    var block = $("[data-completeness]");

    if (valueEl) {
      valueEl.textContent = pct + "%";
    }
    if (fill) {
      fill.setAttribute("width", String(pct));
      window.requestAnimationFrame(function () { fill.classList.add("is-on"); });
    }
    if (block) {
      var svg = block.querySelector("svg");
      if (svg) {
        svg.setAttribute("aria-label", "Profile completeness " + pct + " percent");
      }
    }
  }

  /* ------------------------------------------------------------ premium extras */

  var ICONS = {
    calendar: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15\" rx=\"2.5\"/><path d=\"M3.5 9.5h17M8 3.5v3M16 3.5v3\"/></svg>",
    chat: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.3-5A7.5 7.5 0 1 1 20 12Z\"/></svg>",
    clipboard: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 4h6l1 3h3v13H5V7h3l1-3Z\"/><path d=\"M9 12.5l2 2 4-4.5\"/></svg>",
    card: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"5.5\" width=\"19\" height=\"13\" rx=\"2.5\"/><path d=\"M2.5 9.5h19M6 14.5h4\"/></svg>",
    users: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20\"/><circle cx=\"10\" cy=\"7\" r=\"3\"/><path d=\"M16 4.7a3 3 0 0 1 0 5.8M20 19.9v-1.4a4.4 4.4 0 0 0-3.1-4.2\"/></svg>",
    clock: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7.5V12l3 2\"/></svg>",
    chart: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 17.5 9 11l4 4 8-8.5\"/><path d=\"M15 6.5h6v6\"/></svg>"
  };

  var quickActions = [
    { label: "My schedule", sub: "Today's visits", view: "#ds-schedule", icon: ICONS.calendar },
    { label: "Availability", sub: "Update slots", view: "#ds-availability", icon: ICONS.clock },
    { label: "Earnings", sub: "Payouts & tax", view: "#ds-earnings", icon: ICONS.chart },
    { label: "Clients", sub: "Who you support", view: "#ds-clients", icon: ICONS.users }
  ];

  var visitRequests = [
    { name: "Margaret Doyle", avatar: "images/avatar-sara.webp", service: "Home nursing · Thu 9:00 AM", status: "New" },
    { name: "Grace Okafor", avatar: "images/avatar-amira.webp", service: "Companionship · Sat 11:00 AM", status: "New" }
  ];

  var badges = [
    { icon: "&#9733;", label: "Top rated", sub: "4.8 average" },
    { icon: "&#10003;", label: "Punctual", sub: "100% on time" },
    { icon: "&#9829;", label: "Kindness", sub: "Family favourite" },
    { icon: "&#9889;", label: "Reliable", sub: "0 cancellations" }
  ];

  var careNotes = [
    { name: "Margaret Doyle", avatar: "images/avatar-sara.webp", text: "slept well and had a good appetite today.", time: "Today · 9:50 AM" },
    { name: "Thomas Nguyen", avatar: "images/avatar-robert.webp", text: "knee feeling much better after rest.", time: "Yesterday · 3:10 PM" },
    { name: "Grace Okafor", avatar: "images/avatar-amira.webp", text: "enjoyed the garden walk and music.", time: "2 days ago" }
  ];

  var conversations = [
    { name: "Margaret's family", avatar: "images/avatar-sara.webp", snippet: "Could we add a morning visit?", time: "20 min ago", unread: true },
    { name: "Thomas Nguyen", avatar: "images/avatar-robert.webp", snippet: "Thanks for the notes!", time: "3 h ago", unread: false },
    { name: "Care coordinator", avatar: "images/caregiver-elena.webp", snippet: "October rota is ready.", time: "Yesterday", unread: false }
  ];

  var payoutSummary = [
    { label: "Next payout", value: "$1,280", trend: { dir: "up", text: "Oct 18" }, icon: ICONS.card },
    { label: "This month", value: "$3,250", trend: { dir: "up", text: "+5% vs Sep" }, icon: ICONS.chart },
    { label: "Hours logged", value: "33 h", trend: { dir: "up", text: "This week" }, icon: ICONS.clock }
  ];

  var upcomingVisits = [
    { date: "Thu 12", client: "Margaret Doyle", service: "Home nursing", status: "Confirmed" },
    { date: "Fri 13", client: "Thomas Nguyen", service: "Personal care", status: "Confirmed" },
    { date: "Sat 14", client: "Grace Okafor", service: "Companionship", status: "Pending" }
  ];

  var certifications = [
    { code: "RN", name: "Registered nurse", meta: "State board · valid to 2027" },
    { code: "CPR", name: "CPR & first aid", meta: "Red Cross · valid to 2026" },
    { code: "BG", name: "Background screening", meta: "Cleared · Sep 2026" }
  ];

  var skills = ["Dementia care", "Mobility support", "Medication management", "Companionship", "Wound care", "Meal planning"];

  function renderQuickActions(container, items) {
    if (!container) {
      return;
    }
    container.innerHTML = items.map(function (item) {
      var isView = Boolean(item.view);
      var href = isView ? item.view : item.href;
      var extra = isView ? " data-ds-view-link" : "";
      return "<a class=\"ds-tile\" href=\"" + esc(href) + "\"" + extra + ">" +
        "<span class=\"ds-tile__icon\" aria-hidden=\"true\">" + item.icon + "</span>" +
        "<span><strong>" + esc(item.label) + "</strong><small>" + esc(item.sub) + "</small></span></a>";
    }).join("");
  }

  function renderStatCards(container, items) {
    if (!container) {
      return;
    }
    container.innerHTML = items.map(function (item) {
      var dirClass = (item.trend && item.trend.dir === "down") ? "ds-kpi__trend--down" : "ds-kpi__trend--up";
      var arrow = (item.trend && item.trend.dir === "down") ? "&#9660;" : "&#9650;";
      var trend = item.trend ? "<span class=\"ds-kpi__trend " + dirClass + "\">" + arrow + " " + esc(item.trend.text) + "</span>" : "";
      return "<article class=\"ds-kpi\">" +
        "<div class=\"ds-kpi__top\"><span class=\"ds-kpi__icon\" aria-hidden=\"true\">" + (item.icon || "") + "</span>" + trend + "</div>" +
        "<p class=\"ds-kpi__value\">" + esc(item.value) + "</p><p class=\"ds-kpi__label\">" + esc(item.label) + "</p></article>";
    }).join("");
  }

  function renderVisitRequests() {
    var list = $("[data-visit-requests]");
    if (!list) {
      return;
    }
    list.innerHTML = visitRequests.map(function (request) {
      return "<li class=\"ds-list__item\"><span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(request.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(request.name) + "</strong><span>" + esc(request.service) + "</span></span>" +
        "<span class=\"ds-status ds-status--pending\">" + esc(request.status) + "</span></li>";
    }).join("");
  }

  function renderBadges() {
    var wrap = $("[data-badges]");
    if (!wrap) {
      return;
    }
    wrap.innerHTML = badges.map(function (badge) {
      return "<div class=\"ds-badge-item\"><span class=\"ds-badge-item__icon\" aria-hidden=\"true\">" + badge.icon + "</span>" +
        "<span><strong>" + esc(badge.label) + "</strong><small>" + esc(badge.sub) + "</small></span></div>";
    }).join("");
  }

  function renderCareNotes() {
    var feed = $("[data-care-notes]");
    if (!feed) {
      return;
    }
    feed.innerHTML = careNotes.map(function (note) {
      return "<li class=\"ds-feed__item\"><span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(note.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-feed__body\"><p><strong>" + esc(note.name) + "</strong> " + esc(note.text) + "</p><span class=\"ds-feed__time\">" + esc(note.time) + "</span></span></li>";
    }).join("");
  }

  function renderConversations() {
    var list = $("[data-conversations]");
    if (!list) {
      return;
    }
    list.innerHTML = conversations.map(function (conv) {
      var right = conv.unread ? "<span class=\"ds-status ds-status--pending\">Unread</span>" : "";
      return "<li class=\"ds-list__item\"><span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(conv.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(conv.name) + "</strong><span>" + esc(conv.snippet) + "</span></span>" + right + "</li>";
    }).join("");
  }

  function renderCertifications() {
    var list = $("[data-certifications]");
    if (!list) {
      return;
    }
    list.innerHTML = certifications.map(function (cert) {
      return "<li class=\"ds-list__item\"><span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\">" + esc(cert.code) + "</span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(cert.name) + "</strong><span>" + esc(cert.meta) + "</span></span>" +
        "<span class=\"ds-status ds-status--confirmed\">Verified</span></li>";
    }).join("");
  }

  function renderSkills() {
    var list = $("[data-skills]");
    if (!list) {
      return;
    }
    list.innerHTML = skills.map(function (skill) { return "<li>" + esc(skill) + "</li>"; }).join("");
  }

  function renderPremiumExtras() {
    renderQuickActions($("[data-quick-actions]"), quickActions);
    renderStatCards($("[data-payout-summary]"), payoutSummary);
    renderVisitRequests();
    renderBadges();
    renderCareNotes();
    renderConversations();
    renderCertifications();
    renderSkills();
    fillTable("[data-upcoming-visits]", upcomingVisits.map(function (visit) {
      return [visit.date, visit.client, visit.service, visit.status];
    }));
  }

  /* ------------------------------------------------------------- interactions */

  function setupSidebar() {
    var shell = $("[data-ds]");
    var sidebar = $(".ds-sidebar");
    var scrim = $("[data-ds-scrim]");
    var menuBtn = $("[data-ds-menu]");
    var collapseBtn = $("[data-ds-collapse]");

    function closeMobile() {
      if (!sidebar) {
        return;
      }
      sidebar.classList.remove("is-open");
      if (scrim) {
        scrim.hidden = true;
      }
      if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", "false");
      }
    }

    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", function () {
        var open = !sidebar.classList.contains("is-open");
        sidebar.classList.toggle("is-open", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        if (scrim) {
          scrim.hidden = !open;
        }
      });
    }

    if (scrim) {
      scrim.addEventListener("click", closeMobile);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobile();
      }
    });

    if (collapseBtn && shell) {
      collapseBtn.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 63.99rem)").matches) {
          closeMobile();
          collapseBtn.setAttribute("aria-pressed", "false");
          collapseBtn.setAttribute("aria-label", "Close sidebar");
          return;
        }

        var collapsed = shell.classList.toggle("is-collapsed");
        collapseBtn.setAttribute("aria-pressed", String(collapsed));
        collapseBtn.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
        window.setTimeout(function () {
          var visibleView = $$(".ds-view").filter(function (view) { return !view.hidden; })[0];
          buildChartsIn(visibleView);
        }, 320);
      });
    }

    return { close: closeMobile };
  }

  function setupViews(sidebarApi) {
    var views = $$(".ds-view");
    var links = $$("[data-ds-nav]");
    var viewLinks = $$("[data-ds-view-link], [data-ds-scroll]");
    var crumb = $("[data-ds-crumb]");
    var pageTitle = $("[data-ds-page-title]");

    function showView(id) {
      var target = document.getElementById(id) || views[0];
      if (!target) {
        return;
      }

      views.forEach(function (view) {
        view.hidden = view !== target;
      });

      var topbar = $(".ds-topbar");
      if (topbar) {
        topbar.classList.remove("is-searching");
      }
      var searchToggle = $("[data-ds-search-toggle]");
      if (searchToggle) {
        searchToggle.setAttribute("aria-expanded", "false");
        searchToggle.setAttribute("aria-label", "Search the dashboard");
      }

      var activeLink = null;

      links.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + target.id;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
          activeLink = link;
        } else {
          link.removeAttribute("aria-current");
        }
      });

      var label = activeLink ? (activeLink.getAttribute("data-title") || "Overview") : "Overview";
      if (crumb) {
        crumb.textContent = label;
      }
      if (pageTitle) {
        pageTitle.textContent = label;
      }

      buildChartsIn(target);
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    }

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        showView(link.getAttribute("href").slice(1));
        if (sidebarApi) {
          sidebarApi.close();
        }
      });
    });

    viewLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") {
        return;
      }
      link.addEventListener("click", function (event) {
        event.preventDefault();
        showView(href.slice(1));
        if (sidebarApi) {
          sidebarApi.close();
        }
      });
    });

    var initial = (window.location.hash || "").replace("#", "");
    showView((initial && document.getElementById(initial)) ? initial : (views[0] ? views[0].id : "ds-overview"));

    return { show: showView };
  }

  function setupScrollLinks(sidebarApi) {
    $$("[data-ds-scroll]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var target = document.querySelector(link.getAttribute("href"));
        if (!target) {
          return;
        }
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (sidebarApi) {
          sidebarApi.close();
        }
      });
    });
  }

  function setupSearch() {
    var input = $("[data-ds-search]");
    if (!input) {
      return;
    }

    var searchForm = $("[data-ds-search-form]");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    }

    var status = $("[data-ds-search-status]");
    var clientItems = $$("[data-clients] .ds-list__item");
    var visitItems = $$("[data-today-visits] .ds-list__item");
    var messageItems = $$("[data-messages] .ds-feed__item");
    var clientsEmpty = $("[data-clients-empty]");
    var todayEmpty = $("[data-today-empty]");
    var messagesEmpty = $("[data-messages-empty]");

    function run() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      function filter(items, emptyEl) {
        var shown = 0;
        items.forEach(function (item) {
          var match = !query || (item.getAttribute("data-search") || "").indexOf(query) !== -1;
          item.hidden = !match;
          if (match) {
            shown += 1;
          }
        });
        if (emptyEl) {
          emptyEl.hidden = shown !== 0;
        }
        return shown;
      }

      visible += filter(clientItems, clientsEmpty);
      visible += filter(visitItems, todayEmpty);
      visible += filter(messageItems, messagesEmpty);

      if (status) {
        status.textContent = query ? (visible + " result" + (visible === 1 ? "" : "s") + " for \"" + input.value.trim() + "\"") : "";
      }
    }

    input.addEventListener("input", run);
  }

  function setupNotifications() {
    var button = $("[data-ds-notif]");
    var panel = $("[data-ds-notif-panel]");
    if (!button || !panel) {
      return;
    }

    function close() {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
    }

    button.addEventListener("click", function () {
      var open = panel.hidden;
      panel.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", function (event) {
      if (panel.hidden) {
        return;
      }
      if (panel.contains(event.target) || button.contains(event.target)) {
        return;
      }
      close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        close();
      }
    });
  }

  function setupSwitches() {
    $$("[data-ds-switch]").forEach(function (button) {
      button.addEventListener("click", function () {
        var checked = button.getAttribute("aria-checked") === "true";
        button.setAttribute("aria-checked", String(!checked));
      });
    });
  }

  function setupProfileEdit() {
    var editBtn = $("[data-ds-edit]");
    var view = $("[data-ds-profile-view]");
    var form = $("[data-ds-profile-form]");
    var cancelBtn = $("[data-ds-cancel]");
    var status = $("[data-ds-profile-status]");

    if (!editBtn || !form) {
      return;
    }

    function openForm() {
      form.querySelector("#cg-pf-name").value = user.fullName || "";
      form.querySelector("#cg-pf-phone").value = user.phone || "";
      form.querySelector("#cg-pf-expertise").value = EXPERTISE_LABELS[user.expertise] ? user.expertise : "";
      form.querySelector("#cg-pf-experience").value = EXPERIENCE_LABELS[user.experience] ? user.experience : "";
      form.querySelector("#cg-pf-city").value = user.city || "";
      form.hidden = false;
      if (view) {
        view.hidden = true;
      }
      editBtn.hidden = true;
      if (status) {
        status.textContent = "";
      }
      var first = form.querySelector("#cg-pf-name");
      if (first) {
        first.focus();
      }
    }

    function closeForm() {
      form.hidden = true;
      if (view) {
        view.hidden = false;
      }
      editBtn.hidden = false;
    }

    editBtn.addEventListener("click", openForm);

    if (cancelBtn) {
      cancelBtn.addEventListener("click", closeForm);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.querySelector("#cg-pf-name").value.trim();

      if (!name) {
        if (status) {
          status.textContent = "Please enter your full name.";
        }
        form.querySelector("#cg-pf-name").focus();
        return;
      }

      user.fullName = name;
      user.phone = form.querySelector("#cg-pf-phone").value.trim();
      user.expertise = form.querySelector("#cg-pf-expertise").value;
      user.experience = form.querySelector("#cg-pf-experience").value;
      user.city = form.querySelector("#cg-pf-city").value.trim();
      writeUser(user);

      populateHeader();
      populateProfileView();
      renderCompleteness();
      closeForm();
      if (status) {
        status.textContent = "Saved.";
      }
    });
  }

  function setupLogout() {
    var button = $("[data-ds-logout]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        /* ignore */
      }
      window.location.href = "login.html";
    });
  }

  function setupSearchToggle() {
    var toggle = $("[data-ds-search-toggle]");
    var topbar = $(".ds-topbar");
    var input = $("[data-ds-search]");
    if (!toggle || !topbar) {
      return;
    }

    function setOpen(open) {
      topbar.classList.toggle("is-searching", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close search" : "Search the dashboard");
      if (open && input) {
        input.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!topbar.classList.contains("is-searching"));
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && topbar.classList.contains("is-searching")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  function setupResize() {
    var timer = null;
    var lastWidth = window.innerWidth;
    window.addEventListener("resize", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        if (Math.abs(window.innerWidth - lastWidth) < 24) {
          return;
        }
        lastWidth = window.innerWidth;
        var visibleView = $$(".ds-view").filter(function (view) { return !view.hidden; })[0];
        buildChartsIn(visibleView);
      }, 200);
    });
  }

  /* --------------------------------------------------------------------- init */

  function init() {
    tip = $("#ds-tooltip");
    populateHeader();
    populateProfileView();
    renderKpis();
    renderTodayVisits();
    renderClients();
    renderReviews();
    renderMessages();
    renderTasks();
    renderNotes();
    renderAvailability();
    renderCompleteness();
    renderPremiumExtras();

    var sidebarApi = setupSidebar();
    setupViews(sidebarApi);
    setupSearch();
    setupSearchToggle();
    setupNotifications();
    setupSwitches();
    setupProfileEdit();
    setupLogout();
    setupResize();

    var gaugeSummary = $("[data-gauge-summary]");
    if (gaugeSummary) {
      gaugeSummary.textContent = "You are rated " + ratingAverage.toFixed(1) + " out of 5 across "
        + reviews.length + " recent reviews — among the top caregivers in " + (user.city || "your area") + ".";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
