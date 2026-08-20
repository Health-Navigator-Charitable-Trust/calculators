// HEAL Pregnancy (due date) calculator.
// Logic matches the Healthify reference (original: Dr Jeremy Steinberg).
// Renders into any container. Used by pregnancy/index.html (iframe)
// and pregnancy/embed.js (script tag + shadow DOM).
window.healRenderPregnancy = function (container) {
  "use strict";

  var DAY_MS = 86400000;
  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // NZ antenatal screening schedule (from the reference calculator).
  // prefix "from" -> earliest date; prefix "by" -> latest date; range -> both.
  var SCREENING = [
    { name: "Folic acid supplementation", desc: "Ideally from at least 4 weeks before conception until 12 weeks gestation", prefix: "from", start: { w: -4, d: 0 }, end: { w: 12, d: 0 } },
    { name: "Iodine supplementation", desc: "During whole pregnancy and breastfeeding", prefix: "from", single: { w: 0, d: 0 } },
    { name: "Flu vaccination", desc: "At any gestation", prefix: "from", start: { w: 0, d: 0 }, end: { w: 40, d: 0 } },
    { name: "First antenatal blood, urine and STI test", desc: "Ideally by 9 weeks", prefix: "by", single: { w: 9, d: 0 } },
    { name: "NIPT (non-invasive prenatal testing)", desc: "From 10 weeks onwards as an optional non-funded test", prefix: "from", single: { w: 10, d: 0 } },
    { name: "Register with an LMC", desc: "By 12 weeks at the latest", prefix: "by", single: { w: 12, d: 0 } },
    { name: "Nuchal translucency scan (MSS1 - scan)", desc: "Between 11 weeks 2 days and 13 weeks 6 days", prefix: "from", start: { w: 11, d: 2 }, end: { w: 13, d: 6 } },
    { name: "First trimester combined screening (MSS1 - blood)", desc: "Available between 9 weeks and 13 weeks 6 days", prefix: "from", start: { w: 9, d: 0 }, end: { w: 13, d: 6 } },
    { name: "Blood pressure and urine dipstick tests", desc: "At all antenatal visits after initial antenatal test", prefix: "from", single: { w: 12, d: 0 } },
    { name: "Whooping cough booster", desc: "From 13 weeks; best between 16 weeks and at least 2 weeks before delivery", prefix: "from", single: { w: 13, d: 0 } },
    { name: "Second trimester maternal serum screening (MSS2)", desc: "Available between 14-20 weeks if MSS1 not done", prefix: "from", start: { w: 14, d: 0 }, end: { w: 20, d: 0 } },
    { name: "Anatomy scan", desc: "Between 18-20 weeks", prefix: "from", start: { w: 18, d: 0 }, end: { w: 20, d: 0 } },
    { name: "Further antenatal blood tests incl. diabetes testing", desc: "Between 24-28 weeks", prefix: "from", start: { w: 24, d: 0 }, end: { w: 28, d: 0 } },
    { name: "Growth scans", desc: "Third trimester if there is a medical indication", prefix: "from", single: { w: 28, d: 0 } },
  ];

  function today() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  function parseDate(value) {
    if (!value) return null;
    var p = value.split("-");
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }
  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }
  function diffDays(later, earlier) {
    return Math.round((later - earlier) / DAY_MS);
  }
  function fmt(date) {
    return date.getDate() + " " + MONTHS[date.getMonth()] + " " + date.getFullYear();
  }
  function plural(n, word) {
    return n + " " + word + (n === 1 ? "" : "s");
  }
  function gestText(totalDays) {
    if (totalDays < 0) return "0 weeks 0 days";
    return plural(Math.floor(totalDays / 7), "week") + " " + plural(totalDays % 7, "day");
  }
  function timingDays(t) { return t.w * 7 + t.d; }

  container.innerHTML =
    '<div class="heal-calc">' +
      '<div class="heal-head"><h2 class="heal-title">Pregnancy calculator</h2></div>' +
      '<p class="heal-sub">Due date and gestation · LMP + 280 days method</p>' +

      '<form novalidate>' +
        '<div class="heal-field">' +
          '<label for="heal-pg-mode">Calculate from</label>' +
          '<select id="heal-pg-mode">' +
            '<option value="lmp">Last menstrual period (LMP)</option>' +
            '<option value="uss">Ultrasound due date</option>' +
            '<option value="gestation">Current gestation (weeks + days)</option>' +
            '<option value="conception">Date of conception</option>' +
            '<option value="day3">Day 3 blastocyst transfer</option>' +
            '<option value="day5">Day 5 blastocyst transfer</option>' +
            '<option value="customdate">Gestation at a future or past date</option>' +
            '<option value="customgestation">Date at a future or past gestation</option>' +
          '</select>' +
        '</div>' +
        '<div class="heal-field" data-panel="lmp uss conception day3 day5 customdate">' +
          '<label for="heal-pg-date"><span class="heal-date-lbl">First day of last menstrual period</span></label>' +
          '<input type="date" id="heal-pg-date">' +
        '</div>' +
        '<div class="heal-field" data-panel="gestation customgestation" hidden>' +
          '<div class="heal-row">' +
            '<div class="heal-field"><label for="heal-pg-weeks">Weeks</label>' +
              '<input type="number" id="heal-pg-weeks" inputmode="numeric" min="0" max="42" placeholder="e.g. 12"></div>' +
            '<div class="heal-field" data-days><label for="heal-pg-days">Days</label>' +
              '<input type="number" id="heal-pg-days" inputmode="numeric" min="0" max="6" placeholder="e.g. 3"></div>' +
          '</div>' +
        '</div>' +
      '</form>' +

      '<p class="heal-disc" data-panel="customdate customgestation" hidden>' +
        'Uses the current gestation from your last calculation: <strong class="heal-pg-current">not calculated yet — use another mode first</strong>.' +
      '</p>' +

      '<p class="heal-error" hidden></p>' +
      '<div class="heal-preg-results" hidden></div>' +

      '<div class="heal-progress" hidden>' +
        '<div class="heal-progress-text"></div>' +
        '<div class="heal-progress-track"><div class="heal-progress-fill"></div></div>' +
        '<div class="heal-progress-labels"><span>1st trimester</span><span>2nd trimester</span><span>3rd trimester</span></div>' +
      '</div>' +

      '<div class="heal-screen" hidden>' +
        '<h3 class="heal-screen-title">Important dates</h3>' +
        '<div class="heal-screen-list"></div>' +
        '<p class="heal-screen-note">Highlighted = due at your current gestation.</p>' +
      '</div>' +

      '<p class="heal-disc">General guide only — your LMC or ultrasound dating takes precedence.</p>' +
      '<p class="heal-footer">Brought to you by <a href="https://healthify.nz" target="_blank" rel="noopener">Healthify</a></p>' +
    '</div>';

  var DATE_LABELS = {
    lmp: "First day of last menstrual period",
    uss: "Due date from ultrasound",
    conception: "Date of conception",
    day3: "Day 3 blastocyst transfer date",
    day5: "Day 5 blastocyst transfer date",
    customdate: "Future or past date",
  };

  var modeEl = container.querySelector("#heal-pg-mode");
  var dateEl = container.querySelector("#heal-pg-date");
  var dateLbl = container.querySelector(".heal-date-lbl");
  var weeksEl = container.querySelector("#heal-pg-weeks");
  var daysEl = container.querySelector("#heal-pg-days");
  var daysField = container.querySelector("[data-days]");
  var errorEl = container.querySelector(".heal-error");
  var resultsEl = container.querySelector(".heal-preg-results");
  var progressEl = container.querySelector(".heal-progress");
  var screenEl = container.querySelector(".heal-screen");
  var currentEl = container.querySelector(".heal-pg-current");

  var currentGestDays = null; // set by modes 1-6, used by custom modes

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
    resultsEl.hidden = true;
    progressEl.hidden = true;
    screenEl.hidden = true;
  }

  function setRows(rows) {
    var h = "";
    for (var i = 0; i < rows.length; i++) {
      h += '<div class="heal-preg-row"><span class="heal-preg-lbl">' + rows[i][0] +
        '</span><span class="heal-preg-val">' + rows[i][1] + "</span></div>";
    }
    resultsEl.innerHTML = h;
    resultsEl.hidden = false;
    errorEl.hidden = true;
  }

  function updateProgress(gestDays) {
    if (gestDays === null || gestDays < 0 || gestDays > 280) {
      progressEl.hidden = true;
      return;
    }
    var trimester = gestDays < 91 ? "1st trimester" : gestDays < 182 ? "2nd trimester" : "3rd trimester";
    progressEl.querySelector(".heal-progress-text").textContent = gestText(gestDays) + " (" + trimester + ")";
    progressEl.querySelector(".heal-progress-fill").style.width = ((gestDays / 280) * 100) + "%";
    progressEl.hidden = false;
  }

  function updateScreening(edd, gestDays) {
    var list = screenEl.querySelector(".heal-screen-list");
    var h = "";
    for (var i = 0; i < SCREENING.length; i++) {
      var t = SCREENING[i];
      var dates, due = false;
      if (t.single) {
        var td = timingDays(t.single);
        var date = addDays(edd, td - 280);
        dates = (t.prefix === "by" ? "by " : "from ") + fmt(date);
        due = gestDays !== null && (t.prefix === "by" ? gestDays <= td : gestDays >= td);
      } else {
        var s = timingDays(t.start), e = timingDays(t.end);
        dates = fmt(addDays(edd, s - 280)) + " – " + fmt(addDays(edd, e - 280));
        due = gestDays !== null && gestDays >= s && gestDays <= e;
      }
      h += '<div class="heal-screen-item' + (due ? " heal-screen-item--due" : "") + '">' +
        '<div class="heal-screen-name">' + t.name + "</div>" +
        '<div class="heal-screen-desc">' + t.desc + "</div>" +
        '<div class="heal-screen-dates">' + dates + "</div></div>";
    }
    list.innerHTML = h;
    screenEl.hidden = false;
  }

  function applyResult(rows, gestDays, edd) {
    setRows(rows);
    currentGestDays = gestDays;
    currentEl.textContent = gestDays !== null ? gestText(gestDays) : "not calculated yet — use another mode first";
    updateProgress(gestDays);
    if (edd) {
      updateScreening(edd, gestDays);
    } else {
      screenEl.hidden = true;
    }
  }

  function mode() { return modeEl.value; }

  function render() {
    var m = mode();

    // Panel visibility + labels
    var panels = container.querySelectorAll("[data-panel]");
    for (var i = 0; i < panels.length; i++) {
      panels[i].hidden = panels[i].getAttribute("data-panel").split(" ").indexOf(m) === -1;
    }
    dateLbl.textContent = DATE_LABELS[m] || "";
    daysField.hidden = m !== "gestation";

    // Custom modes need a prior calculation
    if (m === "customdate" || m === "customgestation") {
      if (currentGestDays === null) {
        showError("Do another calculation method first to get current gestation");
        return;
      }
      if (m === "customdate") {
        var cd = parseDate(dateEl.value);
        if (!cd) { showError("Enter a valid date"); return; }
        var at = currentGestDays + diffDays(cd, today());
        applyResult([["Gestation on " + fmt(cd), gestText(at)]], currentGestDays, null);
        return;
      }
      // customgestation
      var tw = parseInt(weeksEl.value, 10);
      if (isNaN(tw) || tw < 0 || tw > 42) { showError("Enter a valid gestation in weeks (0-42)."); return; }
      var target = today();
      applyResult([["Date at " + plural(tw, "week"), fmt(addDays(target, tw * 7 - currentGestDays))]], currentGestDays, null);
      return;
    }

    if (m === "gestation") {
      var w = parseInt(weeksEl.value, 10);
      var d = parseInt(daysEl.value, 10);
      if (isNaN(w) || w < 0 || w > 42) { showError("Enter a valid number of weeks (0-42)."); return; }
      if (isNaN(d) || d < 0 || d > 6) { showError("Enter a valid number of days (0-6)."); return; }
      var g = w * 7 + d;
      var lmpG = addDays(today(), -g);
      var eddG = addDays(lmpG, 280);
      applyResult([["Last menstrual period", fmt(lmpG)], ["Estimated due date", fmt(eddG)]], g, eddG);
      return;
    }

    // Date-based modes
    var input = parseDate(dateEl.value);
    if (!input) { showError("Enter a valid date"); return; }
    var now = today();
    var lmp, edd, gest;

    if (m === "lmp") {
      gest = diffDays(now, input);
      if (gest > 280) { showError("Date too far back"); return; }
      if (gest < 0) { showError("Period must be before today"); return; }
      edd = addDays(input, 280);
      applyResult([["Current gestation", gestText(gest)], ["Estimated due date", fmt(edd)]], gest, edd);
    } else if (m === "uss") {
      lmp = addDays(input, -280);
      gest = diffDays(now, lmp);
      if (gest < 0) { showError("Can't be under 0 weeks pregnant"); return; }
      if (gest > 43 * 7) { showError("Can't be over 43 weeks pregnant"); return; }
      applyResult([["Current gestation", gestText(gest)], ["Estimated LMP", fmt(lmp)]], gest, input);
    } else if (m === "conception") {
      edd = addDays(input, 266);
      gest = diffDays(now, input) + 14;
      if (gest > 280) { showError("Date is too far back"); return; }
      if (gest < 14) { showError("Must be before today"); return; }
      applyResult([["Current gestation", gestText(gest)], ["Estimated due date", fmt(edd)]], gest, edd);
    } else if (m === "day3" || m === "day5") {
      var embryoAge = m === "day3" ? 3 : 5;
      lmp = addDays(input, -(14 + embryoAge));
      edd = addDays(lmp, 280);
      gest = diffDays(now, lmp);
      if (gest < 0 || gest > 280) { showError("Calculated gestational age is out of range"); return; }
      applyResult([["Last menstrual period", fmt(lmp)], ["Current gestation", gestText(gest)], ["Estimated due date", fmt(edd)]], gest, edd);
    }
  }

  modeEl.addEventListener("change", function () {
    dateEl.value = "";
    weeksEl.value = "";
    daysEl.value = "";
    errorEl.hidden = true;
    resultsEl.hidden = true;
    progressEl.hidden = true;
    screenEl.hidden = true;
    render();
  });
  dateEl.addEventListener("input", render);
  weeksEl.addEventListener("input", render);
  daysEl.addEventListener("input", render);

  render(); // set initial panel visibility
};
