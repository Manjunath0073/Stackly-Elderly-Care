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

  if (!user || user.role !== "family") {
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
      return "S";
    }
    return (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : "")).toUpperCase();
  }

  function firstName(name) {
    return String(name || "").trim().split(/\s+/)[0] || "there";
  }

  var CARE_TYPE_LABELS = {
    "home-nursing": "Home nursing",
    companionship: "Companionship",
    "personal-care": "Personal care",
    respite: "Respite care",
    "not-sure": "Not sure yet"
  };

  function careTypeLabel(value) {
    return CARE_TYPE_LABELS[value] || value || "Not set";
  }

  var RELATIONSHIP_LABELS = {
    parent: "Parent",
    spouse: "Spouse or partner",
    self: "Myself",
    grandparent: "Grandparent",
    other: "Other",
    "Spouse or partner": "Spouse or partner",
    Myself: "Myself",
    Parent: "Parent",
    Grandparent: "Grandparent",
    Other: "Other"
  };

  function relationshipLabel(value) {
    return RELATIONSHIP_LABELS[value] || value || "Not set";
  }

  /* ------------------------------------------------------------------ data */

  var today = new Date();

  function dateLabel(weeksAgo) {
    var d = new Date(today.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  var careHours = [26, 31, 28, 34, 30, 38, 35, 42].map(function (hours, index) {
    return { label: dateLabel(7 - index), value: hours };
  });

  var vitals = [72, 74, 77, 75, 79, 81, 78, 82, 84, 83, 86, 88, 87, 90].map(function (score, index) {
    var d = new Date(today.getTime() - (13 - index) * 24 * 60 * 60 * 1000);
    return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: score };
  });

  var careTypes = [
    { key: "teal", label: "Nursing", value: 72, color: COLORS.teal },
    { key: "sage", label: "Companionship", value: 46, color: COLORS.sage },
    { key: "gold", label: "Personal care", value: 32, color: COLORS.gold },
    { key: "coral", label: "Nutrition", value: 18, color: COLORS.coral }
  ];

  var caregivers = [
    { name: "Elena Rodriguez", avatar: "images/caregiver-elena.webp" },
    { name: "James Carter", avatar: "images/caregiver-james.webp" },
    { name: "Maya Thompson", avatar: "images/caregiver-maya.webp" }
  ];

  var appointments = [
    { inDays: 1, time: "9:00 AM", caregiver: caregivers[0], service: "Home nursing visit", status: "Confirmed" },
    { inDays: 3, time: "2:30 PM", caregiver: caregivers[1], service: "Physiotherapy & mobility", status: "Confirmed" },
    { inDays: 5, time: "11:00 AM", caregiver: caregivers[2], service: "Companionship outing", status: "Pending" },
    { inDays: 6, time: "4:00 PM", caregiver: caregivers[0], service: "Medication review", status: "Confirmed" }
  ];

  var activity = [
    { caregiver: caregivers[2], text: "logged morning vitals — all within range.", time: "2 hours ago" },
    { caregiver: caregivers[0], text: "completed the nursing visit and updated the care plan.", time: "Yesterday" },
    { caregiver: caregivers[1], text: "added a new mobility exercise to the weekly routine.", time: "2 days ago" },
    { caregiver: caregivers[2], text: "shared lunch photos from the companionship outing.", time: "3 days ago" },
    { caregiver: caregivers[0], text: "flagged a pharmacy refill due next week.", time: "4 days ago" }
  ];

  var progress = [
    { label: "Weekly care hours", value: 72 },
    { label: "Medication adherence", value: 96 },
    { label: "Mobility exercises", value: 55 },
    { label: "Hydration & nutrition", value: 80 }
  ];

  var invoices = [
    { id: "INV-2043", date: "Oct 1, 2026", service: "Home nursing", amount: "$1,240.00", status: "Due" },
    { id: "INV-2031", date: "Sep 1, 2026", service: "Personal care", amount: "$960.00", status: "Paid" },
    { id: "INV-2019", date: "Aug 1, 2026", service: "Companionship", amount: "$620.00", status: "Paid" }
  ];

  var kpis = [
    {
      key: "caregivers",
      label: "Active caregivers",
      value: String(caregivers.length),
      trend: { dir: "up", text: "+1 this month" },
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20\"/><circle cx=\"10\" cy=\"7\" r=\"3\"/><path d=\"M16 4.7a3 3 0 0 1 0 5.8M20 19.9v-1.4a4.4 4.4 0 0 0-3.1-4.2\"/></svg>"
    },
    {
      key: "hours",
      label: "Care hours (this month)",
      value: "168 h",
      trend: { dir: "up", text: "+12% vs last month" },
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7.5V12l3 2\"/></svg>"
    },
    {
      key: "appointments",
      label: "Upcoming visits",
      value: String(appointments.length),
      trend: { dir: "up", text: "Next 7 days" },
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15\" rx=\"2.5\"/><path d=\"M3.5 9.5h17M8 3.5v3M16 3.5v3\"/></svg>"
    },
    {
      key: "spend",
      label: "Monthly spend",
      value: "$3,420",
      trend: { dir: "down", text: "-4% vs last month" },
      icon: "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"5.5\" width=\"19\" height=\"13\" rx=\"2.5\"/><path d=\"M2.5 9.5h19M6 14.5h4\"/></svg>"
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
    var name = user.fullName || "Family member";
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
      var confirmed = appointments.filter(function (item) { return item.status === "Confirmed"; }).length;
      summaryEl.textContent = "You have " + appointments.length + " upcoming visits this week (" + confirmed + " confirmed) and your care plan is on track.";
    }

    var usernameEl = $("[data-ds-username]");
    if (usernameEl) {
      usernameEl.textContent = name;
    }

    var roleEl = $("[data-ds-role]");
    if (roleEl) {
      roleEl.textContent = "Family";
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
        "<li><strong>" + esc(relationshipLabel(user.relationship)) + "</strong> relationship</li>" +
        "<li><strong>" + esc(careTypeLabel(user.careType)) + "</strong> care requested</li>" +
        "<li><strong>" + esc(user.email || "—") + "</strong></li>";
    }
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
      ["Relationship", relationshipLabel(user.relationship)],
      ["Care type", careTypeLabel(user.careType)],
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

  function buildBarChart(container, tableSelector, data) {
    var W = chartWidth(container);
    var H = 260;
    var padL = 46;
    var padR = 14;
    var padT = 16;
    var padB = 42;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }));
    var niceMax = Math.ceil(max / 10) * 10;
    var n = data.length;
    var slot = plotW / n;
    var barW = Math.min(40, slot * 0.52);
    var parts = [];

    parts.push("<svg viewBox=\"0 0 " + W + " " + H + "\" role=\"img\" aria-label=\"Bar chart of weekly care hours for the last " + n + " weeks.\" preserveAspectRatio=\"xMidYMid meet\">");

    for (var g = 0; g <= 4; g += 1) {
      var y = padT + plotH * (g / 4);
      var value = Math.round(niceMax * (1 - g / 4));
      parts.push("<line class=\"ds-grid-line\" x1=\"" + padL + "\" y1=\"" + y + "\" x2=\"" + (padL + plotW) + "\" y2=\"" + y + "\"/>");
      parts.push("<text class=\"ds-axis-label\" x=\"" + (padL - 8) + "\" y=\"" + (y + 4) + "\" text-anchor=\"end\">" + value + "</text>");
    }

    data.forEach(function (d, index) {
      var h = plotH * (d.value / niceMax);
      var x = padL + slot * index + (slot - barW) / 2;
      var y = padT + plotH - h;
      parts.push("<rect class=\"ds-bar\" x=\"" + x.toFixed(1) + "\" y=\"" + y.toFixed(1) + "\" width=\"" + barW.toFixed(1) + "\" height=\"" + h.toFixed(1) + "\" rx=\"6\" tabindex=\"0\" data-tip=\"" + esc(d.label + " · " + d.value + " care hours") + "\" aria-label=\"" + esc(d.label + ": " + d.value + " care hours") + "\"/>");
      parts.push("<text class=\"ds-axis-label\" x=\"" + (padL + slot * index + slot / 2).toFixed(1) + "\" y=\"" + (H - 16) + "\" text-anchor=\"middle\">" + esc(d.label) + "</text>");
    });

    parts.push("</svg>");
    container.innerHTML = parts.join("");
    bindTips(container);
    fillTable(tableSelector, data.map(function (d) { return [d.label, d.value + " h"]; }));

    if (!reduceMotion) {
      window.requestAnimationFrame(function () { container.classList.add("is-ready"); });
    } else {
      container.classList.add("is-ready");
    }
  }

  function buildAreaChart(container, tableSelector, data) {
    var W = chartWidth(container);
    var H = 260;
    var padL = 40;
    var padR = 14;
    var padT = 18;
    var padB = 40;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var n = data.length;
    var xs = data.map(function (d, i) { return Math.round(padL + (n > 1 ? plotW * (i / (n - 1)) : plotW / 2)); });
    var ys = data.map(function (d) { return Math.round(padT + plotH * (1 - d.value / 100)); });
    var line = smoothPath(xs, ys);
    var area = line + " L " + xs[n - 1] + " " + (padT + plotH) + " L " + xs[0] + " " + (padT + plotH) + " Z";
    var gradId = "dsAreaGrad-" + Math.random().toString(36).slice(2, 7);
    var parts = [];

    parts.push("<svg viewBox=\"0 0 " + W + " " + H + "\" role=\"img\" aria-label=\"Area chart of daily wellbeing score over the last " + n + " days.\" preserveAspectRatio=\"xMidYMid meet\">");
    parts.push("<defs><linearGradient id=\"" + gradId + "\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0%\" stop-color=\"" + COLORS.teal + "\" stop-opacity=\"0.28\"/><stop offset=\"100%\" stop-color=\"" + COLORS.teal + "\" stop-opacity=\"0\"/></linearGradient></defs>");

    [0, 25, 50, 75, 100].forEach(function (value) {
      var y = padT + plotH * (1 - value / 100);
      parts.push("<line class=\"ds-grid-line\" x1=\"" + padL + "\" y1=\"" + y + "\" x2=\"" + (padL + plotW) + "\" y2=\"" + y + "\"/>");
      parts.push("<text class=\"ds-axis-label\" x=\"" + (padL - 8) + "\" y=\"" + (y + 4) + "\" text-anchor=\"end\">" + value + "</text>");
    });

    var targetY = padT + plotH * (1 - 80 / 100);
    parts.push("<line class=\"ds-target-line\" x1=\"" + padL + "\" y1=\"" + targetY + "\" x2=\"" + (padL + plotW) + "\" y2=\"" + targetY + "\"/>");

    parts.push("<path class=\"ds-area-fill\" d=\"" + area + "\" fill=\"url(#" + gradId + ")\"/>");
    parts.push("<path class=\"ds-area-line\" d=\"" + line + "\"/>");

    data.forEach(function (d, index) {
      var step = n > 10 ? 2 : 1;
      if (index % step === 0 || index === n - 1) {
        parts.push("<text class=\"ds-axis-label\" x=\"" + xs[index] + "\" y=\"" + (H - 14) + "\" text-anchor=\"middle\">" + esc(d.label) + "</text>");
      }
      parts.push("<circle class=\"ds-point\" cx=\"" + xs[index] + "\" cy=\"" + ys[index] + "\" r=\"4\" tabindex=\"0\" data-tip=\"" + esc(d.label + " · wellbeing " + d.value + "/100") + "\" aria-label=\"" + esc(d.label + ": wellbeing " + d.value + " out of 100") + "\"/>");
    });

    parts.push("</svg>");
    container.innerHTML = parts.join("");
    bindTips(container);
    fillTable(tableSelector, data.map(function (d) { return [d.label, d.value]; }));

    if (!reduceMotion) {
      window.requestAnimationFrame(function () { container.classList.add("is-ready"); });
    } else {
      container.classList.add("is-ready");
    }
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

    parts.push("<svg viewBox=\"0 0 " + size + " " + size + "\" role=\"img\" aria-label=\"Donut chart showing the mix of care types this month.\" preserveAspectRatio=\"xMidYMid meet\">");
    parts.push("<g transform=\"rotate(-90 " + cx + " " + cy + ")\">");
    segments.forEach(function (segment) {
      var length = circumference * (segment.value / total);
      parts.push("<circle class=\"ds-seg\" cx=\"" + cx + "\" cy=\"" + cy + "\" r=\"" + r + "\" stroke=\"" + segment.color + "\" stroke-dasharray=\"0 " + circumference.toFixed(2) + "\" stroke-dashoffset=\"" + (-offset).toFixed(2) + "\" data-len=\"" + length.toFixed(2) + "\" data-c=\"" + circumference.toFixed(2) + "\" tabindex=\"0\" data-tip=\"" + esc(segment.label + " · " + segment.value + " h (" + Math.round((segment.value / total) * 100) + "%)") + "\" aria-label=\"" + esc(segment.label + ": " + segment.value + " hours") + "\"/>");
      offset += length;
    });
    parts.push("</g>");
    parts.push("<text class=\"ds-donut-total\" x=\"" + cx + "\" y=\"" + (cy - 1) + "\" text-anchor=\"middle\">" + total + " h</text>");
    parts.push("<text class=\"ds-donut-sub\" x=\"" + cx + "\" y=\"" + (cy + 18) + "\" text-anchor=\"middle\">THIS MONTH</text>");
    parts.push("</svg>");

    parts.push("<ul class=\"ds-chart-legend\">");
    segments.forEach(function (segment) {
      parts.push("<li><span class=\"ds-chart-legend__swatch ds-chart-legend__swatch--" + segment.key + "\"></span>" + esc(segment.label) + "<strong>" + Math.round((segment.value / total) * 100) + "%</strong></li>");
    });
    parts.push("</ul>");

    container.innerHTML = parts.join("");
    bindTips(container);
    fillTable(tableSelector, segments.map(function (segment) {
      return [segment.label, segment.value + " h", Math.round((segment.value / total) * 100) + "%"];
    }));

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        $$(".ds-seg", container).forEach(function (seg) {
          seg.setAttribute("stroke-dasharray", seg.getAttribute("data-len") + " " + seg.getAttribute("data-c"));
        });
      });
    });
  }

  function buildChartsIn(root) {
    if (!root) {
      return;
    }
    var hoursContainer = root.querySelector("[data-chart=\"care-hours\"]");
    var vitalsContainer = root.querySelector("[data-chart=\"vitals\"]");
    var typesContainer = root.querySelector("[data-chart=\"care-types\"]");

    if (hoursContainer) {
      buildBarChart(hoursContainer, "[data-table=\"care-hours\"]", careHours);
    }
    if (vitalsContainer) {
      buildAreaChart(vitalsContainer, "[data-table=\"vitals\"]", vitals);
    }
    if (typesContainer) {
      buildDonutChart(typesContainer, "[data-table=\"care-types\"]", careTypes);
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

  function renderAppointments() {
    var list = $("[data-appointments]");
    if (!list) {
      return;
    }

    list.innerHTML = appointments.map(function (item) {
      var d = new Date(today.getTime() + item.inDays * 24 * 60 * 60 * 1000);
      var statusClass = item.status === "Pending" ? "ds-status--pending" : "ds-status--confirmed";
      var search = (item.caregiver.name + " " + item.service + " " + item.status).toLowerCase();
      return "<li class=\"ds-list__item\" data-search=\"" + esc(search) + "\">" +
        "<span class=\"ds-list__date\"><strong>" + d.getDate() + "</strong><span>" + d.toLocaleDateString("en-US", { month: "short" }) + "</span></span>" +
        "<span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(item.caregiver.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(item.service) + "</strong><span>" + esc(item.caregiver.name) + " &middot; " + esc(item.time) + "</span></span>" +
        "<span class=\"ds-status " + statusClass + "\">" + esc(item.status) + "</span>" +
        "</li>";
    }).join("");
  }

  function renderActivity() {
    var feed = $("[data-activity]");
    if (!feed) {
      return;
    }

    feed.innerHTML = activity.map(function (item) {
      var search = (item.caregiver.name + " " + item.text).toLowerCase();
      return "<li class=\"ds-feed__item\" data-search=\"" + esc(search) + "\">" +
        "<span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(item.caregiver.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-feed__body\"><p><strong>" + esc(item.caregiver.name) + "</strong> " + esc(item.text) + "</p><span class=\"ds-feed__time\">" + esc(item.time) + "</span></span>" +
        "</li>";
    }).join("");
  }

  function renderProgress() {
    var wrap = $("[data-progress]");
    if (!wrap) {
      return;
    }

    wrap.innerHTML = progress.map(function (item) {
      var color = item.value >= 80 ? COLORS.teal : (item.value >= 60 ? COLORS.gold : COLORS.coral);
      return "<div class=\"ds-progress\">" +
        "<div class=\"ds-progress__head\"><span class=\"ds-progress__label\">" + esc(item.label) + "</span><span class=\"ds-progress__value\">" + item.value + "%</span></div>" +
        "<svg class=\"ds-progress__track\" viewBox=\"0 0 100 8\" preserveAspectRatio=\"none\" role=\"img\" aria-label=\"" + esc(item.label + ": " + item.value + " percent complete") + "\">" +
        "<rect x=\"0\" y=\"0\" width=\"100\" height=\"8\" rx=\"4\" fill=\"" + COLORS.line + "\"/>" +
        "<rect class=\"ds-progress__fill\" x=\"0\" y=\"0\" width=\"" + item.value + "\" height=\"8\" rx=\"4\" fill=\"" + color + "\"/>" +
        "</svg></div>";
    }).join("");

    window.requestAnimationFrame(function () {
      $$(".ds-progress__fill", wrap).forEach(function (fill) {
        fill.classList.add("is-on");
      });
    });
  }

  function renderInvoices() {
    var table = $("[data-invoices]");
    if (!table) {
      return;
    }

    var tbody = table.querySelector("tbody");
    if (!tbody) {
      return;
    }

    tbody.innerHTML = invoices.map(function (invoice) {
      var badgeClass = invoice.status === "Paid" ? "ds-badge--paid" : (invoice.status === "Due" ? "ds-badge--due" : "ds-badge--overdue");
      return "<tr>" +
        "<td data-label=\"Invoice\"><strong>" + esc(invoice.id) + "</strong></td>" +
        "<td data-label=\"Date\">" + esc(invoice.date) + "</td>" +
        "<td data-label=\"Service\">" + esc(invoice.service) + "</td>" +
        "<td data-label=\"Amount\" class=\"ds-table__amount\">" + esc(invoice.amount) + "</td>" +
        "<td data-label=\"Status\"><span class=\"ds-badge " + badgeClass + "\">" + esc(invoice.status) + "</span></td>" +
        "</tr>";
    }).join("");
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
    { label: "Book a visit", sub: "Schedule care", href: "contact.html", icon: ICONS.calendar },
    { label: "Message team", sub: "Send a note", view: "#ds-messages", icon: ICONS.chat },
    { label: "Care plan", sub: "Weekly goals", view: "#ds-care-plan", icon: ICONS.clipboard },
    { label: "Billing", sub: "Invoices & pay", view: "#ds-billing", icon: ICONS.card }
  ];

  var familyCareTeam = [
    { name: "Elena Rodriguez", avatar: "images/caregiver-elena.webp", role: "Registered nurse" },
    { name: "James Carter", avatar: "images/caregiver-james.webp", role: "Home health aide" },
    { name: "Maya Thompson", avatar: "images/caregiver-maya.webp", role: "Companion caregiver" }
  ];

  var healthAlerts = [
    { level: "gold", text: "Blood pressure slightly elevated this morning.", time: "Today · 8:15 AM" },
    { level: "teal", text: "Medication refill collected from the pharmacy.", time: "Yesterday" },
    { level: "coral", text: "Missed the afternoon walk — gentle encouragement helped.", time: "2 days ago" }
  ];

  var weeklyGoals = [
    { label: "Walk 15 minutes daily", meta: "5 of 7 days complete", done: true },
    { label: "Drink 6 glasses of water", meta: "On track today", done: true },
    { label: "Attend physiotherapy", meta: "Scheduled Thursday", done: false },
    { label: "Video call with family", meta: "Sunday at 4:00 PM", done: false }
  ];

  var medications = [
    { time: "8:00 AM", name: "Amlodipine 5 mg", status: "Taken" },
    { time: "1:00 PM", name: "Metformin 500 mg", status: "Taken" },
    { time: "8:00 PM", name: "Atorvastatin 20 mg", status: "Upcoming" }
  ];

  var pastVisits = [
    { date: "Sep 28", service: "Home nursing", caregiver: "Elena Rodriguez", status: "Completed" },
    { date: "Sep 25", service: "Companionship", caregiver: "Maya Thompson", status: "Completed" },
    { date: "Sep 22", service: "Personal care", caregiver: "James Carter", status: "Completed" }
  ];

  var conversations = [
    { name: "Elena Rodriguez", avatar: "images/caregiver-elena.webp", snippet: "Shared today's vitals report.", time: "10 min ago", unread: true },
    { name: "Maya Thompson", avatar: "images/caregiver-maya.webp", snippet: "Looking forward to Saturday's outing!", time: "2 h ago", unread: false },
    { name: "Care coordinator", avatar: "images/caregiver-james.webp", snippet: "Your October care plan is ready.", time: "Yesterday", unread: false }
  ];

  var billingSummary = [
    { label: "Outstanding", value: "$1,240", trend: { dir: "down", text: "Due Oct 15" }, icon: ICONS.card },
    { label: "Paid this month", value: "$960", trend: { dir: "up", text: "2 invoices" }, icon: ICONS.chart },
    { label: "Next payment", value: "$1,240", trend: { dir: "up", text: "Oct 15" }, icon: ICONS.clipboard }
  ];

  var careRecipients = [
    { name: "Margaret Doyle", avatar: "images/avatar-sara.webp", careType: "Home nursing · 12 h/week" },
    { name: "Thomas Nguyen", avatar: "images/avatar-robert.webp", careType: "Personal care · 8 h/week" }
  ];

  var emergencyContact = [
    ["Name", "Sarah Bennett"],
    ["Relationship", "Daughter"],
    ["Phone", "(800) 555-0148"],
    ["Email", "sarah@example.com"]
  ];

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

  function renderWeekStrip(container, offsets) {
    if (!container) {
      return;
    }
    var parts = [];
    for (var i = 0; i < 7; i += 1) {
      var d = new Date(today.getTime() + i * 86400000);
      var hasVisit = offsets.indexOf(i) !== -1;
      var classes = "ds-week__day" + (i === 0 ? " is-today" : "") + (hasVisit ? " has-visit" : "");
      parts.push("<div class=\"" + classes + "\"><span>" + d.toLocaleDateString("en-US", { weekday: "short" }) + "</span><b>" + d.getDate() + "</b>" + (hasVisit ? "<span class=\"sr-only\">, visit scheduled</span>" : "") + "</div>");
    }
    container.innerHTML = parts.join("");
  }

  function renderCareTeam() {
    var list = $("[data-care-team]");
    if (!list) {
      return;
    }
    list.innerHTML = familyCareTeam.map(function (person) {
      return "<li class=\"ds-list__item\"><span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(person.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(person.name) + "</strong><span>" + esc(person.role) + "</span></span>" +
        "<span class=\"ds-status ds-status--confirmed\">Active</span></li>";
    }).join("");
  }

  function renderHealthAlerts() {
    var feed = $("[data-health-alerts]");
    if (!feed) {
      return;
    }
    feed.innerHTML = healthAlerts.map(function (alert) {
      return "<li class=\"ds-feed__item\"><span class=\"ds-dot ds-dot--" + alert.level + "\" aria-hidden=\"true\"></span>" +
        "<span class=\"ds-feed__body\"><p>" + esc(alert.text) + "</p><span class=\"ds-feed__time\">" + esc(alert.time) + "</span></span></li>";
    }).join("");
  }

  function renderWeeklyGoals() {
    var list = $("[data-weekly-goals]");
    if (!list) {
      return;
    }
    list.innerHTML = weeklyGoals.map(function (goal, index) {
      return "<li class=\"ds-check\"><input type=\"checkbox\" id=\"ds-goal-" + index + "\"" + (goal.done ? " checked" : "") + ">" +
        "<span class=\"ds-check__body\"><label class=\"ds-check__label\" for=\"ds-goal-" + index + "\">" + esc(goal.label) + "</label>" +
        "<span class=\"ds-check__meta\">" + esc(goal.meta) + "</span></span></li>";
    }).join("");
  }

  function renderMedications() {
    var list = $("[data-medications]");
    if (!list) {
      return;
    }
    list.innerHTML = medications.map(function (med) {
      var parts = med.time.split(" ");
      var cls = med.status === "Taken" ? "ds-status--confirmed" : "ds-status--pending";
      return "<li class=\"ds-list__item\"><span class=\"ds-list__date\"><strong>" + esc(parts[0]) + "</strong><span>" + esc(parts[1] || "") + "</span></span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(med.name) + "</strong></span>" +
        "<span class=\"ds-status " + cls + "\">" + esc(med.status) + "</span></li>";
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

  function renderCareRecipients() {
    var list = $("[data-care-recipients]");
    if (!list) {
      return;
    }
    list.innerHTML = careRecipients.map(function (person) {
      return "<li class=\"ds-list__item\"><span class=\"ds-avatar ds-avatar--list\" aria-hidden=\"true\"><img src=\"" + esc(person.avatar) + "\" width=\"96\" height=\"96\" alt=\"\"></span>" +
        "<span class=\"ds-list__body\"><strong>" + esc(person.name) + "</strong><span>" + esc(person.careType) + "</span></span></li>";
    }).join("");
  }

  function renderEmergencyContact() {
    var view = $("[data-emergency-contact]");
    if (!view) {
      return;
    }
    view.innerHTML = emergencyContact.map(function (row) {
      return "<div class=\"ds-profile__row\"><dt class=\"ds-profile__label\">" + esc(row[0]) + "</dt><dd class=\"ds-profile__value\">" + esc(row[1]) + "</dd></div>";
    }).join("");
  }

  function renderPremiumExtras() {
    renderQuickActions($("[data-quick-actions]"), quickActions);
    renderStatCards($("[data-billing-summary]"), billingSummary);
    renderWeekStrip($("[data-week-strip]"), [1, 3, 5, 6]);
    renderCareTeam();
    renderHealthAlerts();
    renderWeeklyGoals();
    renderMedications();
    renderConversations();
    renderCareRecipients();
    renderEmergencyContact();
    fillTable("[data-past-visits]", pastVisits.map(function (visit) {
      return [visit.date, visit.service, visit.caregiver, visit.status];
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
          renderProgress();
        }, 320);
      });
    }

    // expose for nav links
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
    var appointmentItems = $$("[data-appointments] .ds-list__item");
    var activityItems = $$("[data-activity] .ds-feed__item");
    var appointmentsEmpty = $("[data-appointments-empty]");
    var activityEmpty = $("[data-activity-empty]");

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

      visible = filter(appointmentItems, appointmentsEmpty) + filter(activityItems, activityEmpty);

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
      form.querySelector("#ds-pf-name").value = user.fullName || "";
      form.querySelector("#ds-pf-phone").value = user.phone || "";
      form.querySelector("#ds-pf-relationship").value = relationshipLabel(user.relationship) === "Not set" ? "" : relationshipLabel(user.relationship);
      form.querySelector("#ds-pf-careType").value = CARE_TYPE_LABELS[user.careType] ? user.careType : "";
      form.hidden = false;
      if (view) {
        view.hidden = true;
      }
      editBtn.hidden = true;
      if (status) {
        status.textContent = "";
      }
      var first = form.querySelector("#ds-pf-name");
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
      var name = form.querySelector("#ds-pf-name").value.trim();
      var phone = form.querySelector("#ds-pf-phone").value.trim();
      var relationship = form.querySelector("#ds-pf-relationship").value;
      var careType = form.querySelector("#ds-pf-careType").value;

      if (!name) {
        if (status) {
          status.textContent = "Please enter your full name.";
        }
        form.querySelector("#ds-pf-name").focus();
        return;
      }

      user.fullName = name;
      user.phone = phone;
      user.relationship = relationship;
      user.careType = careType;
      writeUser(user);

      populateHeader();
      populateProfileView();
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
        renderProgress();
      }, 200);
    });
  }

  /* --------------------------------------------------------------------- init */

  function init() {
    tip = $("#ds-tooltip");
    populateHeader();
    populateProfileView();
    renderKpis();
    renderAppointments();
    renderActivity();
    renderProgress();
    renderInvoices();
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
