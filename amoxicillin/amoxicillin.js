// HEAL Amoxicillin dose calculator (children, weight-based, NZ Formulary).
// Logic matches the Healthify reference calculator (original: Dr Jeremy Steinberg).
// Renders into any container. Used by amoxicillin/index.html (iframe)
// and amoxicillin/embed.js (script tag + shadow DOM).
window.healRenderAmoxicillin = function (container) {
  "use strict";

  container.innerHTML =
    '<div class="heal-calc">' +
      '<div class="heal-head"><h2 class="heal-title">Amoxicillin dose — children</h2></div>' +
      '<p class="heal-sub">Weight-based · NZ Formulary · ages 1&nbsp;mth–18&nbsp;yr</p>' +

      '<form novalidate>' +
        '<div class="heal-field">' +
          '<label for="heal-a-weight">Child\u2019s weight <span class="heal-u">(kg)</span></label>' +
          '<input type="number" id="heal-a-weight" inputmode="decimal" min="0" max="100" step="0.1" placeholder="e.g. 14.5" autocomplete="off">' +
        '</div>' +
        '<div class="heal-field">' +
          '<label for="heal-a-indication">Indication</label>' +
          '<select id="heal-a-indication">' +
            '<option value="general">General (15–30 mg/kg three times daily)</option>' +
            '<option value="strep">Strep A (once daily for 10 days)</option>' +
          '</select>' +
        '</div>' +
        '<div class="heal-field">' +
          '<label for="heal-a-strength">Liquid strength</label>' +
          '<select id="heal-a-strength">' +
            '<option value="25">Amoxicillin 125 mg / 5 mL</option>' +
            '<option value="50">Amoxicillin 250 mg / 5 mL</option>' +
          '</select>' +
        '</div>' +
      '</form>' +

      '<div class="heal-output" data-state="empty" role="status" aria-live="polite">' +
        '<div class="heal-layer heal-layer-empty">Enter a weight to see the recommended dose.</div>' +
        '<div class="heal-layer heal-layer-result"></div>' +
      '</div>' +

      '<p class="heal-disc">' +
        '<strong>General dosing:</strong> 15–30&nbsp;mg/kg (max 1,000&nbsp;mg) three times daily.<br>' +
        '<strong>Strep A:</strong> under 20&nbsp;kg — 50&nbsp;mg/kg once daily for 10 days; 20&nbsp;kg or over — 1,000&nbsp;mg once daily for 10 days.' +
      '</p>' +
      '<p class="heal-disc">' +
        'Calculations must be re-checked and should not be used alone to guide patient care, ' +
        'nor substitute for clinical judgment. For ages 1&nbsp;month to 18&nbsp;years only.' +
      '</p>' +

      '<p class="heal-footer">Brought to you by <a href="https://healthify.nz" target="_blank" rel="noopener">Healthify</a></p>' +
    '</div>';

  var LOW_MG_PER_KG = 15;        // general low
  var HIGH_MG_PER_KG = 30;       // general high
  var STREP_MG_PER_KG = 50;      // strep A, under 20 kg
  var STREP_WEIGHT_CUTOFF = 20;  // kg
  var MAX_MG = 1000;

  var weightEl = container.querySelector("#heal-a-weight");
  var indicationEl = container.querySelector("#heal-a-indication");
  var strengthEl = container.querySelector("#heal-a-strength");
  var output = container.querySelector(".heal-output");
  var emptyLayer = container.querySelector(".heal-layer-empty");
  var resultLayer = container.querySelector(".heal-layer-result");

  // Reference display rounding: mL to 1 dp, mg to 1 dp (high end of range to 0 dp).
  function roundTo(n, dp) {
    return parseFloat(n.toFixed(dp));
  }
  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function rangeText(low, high) {
    return low < high ? fmt(low) + " – " + fmt(high) : fmt(low);
  }

  function render() {
    var w = parseFloat(weightEl.value);
    var mgPerMl = parseFloat(strengthEl.value);
    var maxMl = MAX_MG / mgPerMl; // 40 mL (125/5) or 20 mL (250/5)
    var strep = indicationEl.value === "strep";

    if (!(w > 0) || w > 100) {
      emptyLayer.textContent = (w > 100)
        ? "Please enter a weight below 100 kg."
        : "Enter a weight to see the recommended dose.";
      output.dataset.state = "empty";
      return;
    }

    var mlText, mgText, freqText, warnText = "";

    if (strep) {
      var mg = w < STREP_WEIGHT_CUTOFF ? STREP_MG_PER_KG * w : MAX_MG;
      if (mg > MAX_MG) mg = MAX_MG;
      var ml = w < STREP_WEIGHT_CUTOFF ? mg / mgPerMl : maxMl;
      if (ml > maxMl) ml = maxMl;
      mlText = fmt(roundTo(ml, 1));
      mgText = fmt(roundTo(mg, 1));
      freqText = "Once daily for 10 days";
    } else {
      var lowMg = Math.min(roundTo(LOW_MG_PER_KG * w, 1), MAX_MG);
      var highMg = Math.min(roundTo(HIGH_MG_PER_KG * w, 0), MAX_MG);
      var lowMl = Math.min(roundTo((LOW_MG_PER_KG * w) / mgPerMl, 1), maxMl);
      var highMl = Math.min(roundTo((HIGH_MG_PER_KG * w) / mgPerMl, 1), maxMl);
      mlText = rangeText(lowMl, highMl);
      mgText = rangeText(lowMg, highMg);
      freqText = "Three times a day";
      if (lowMg >= MAX_MG) {
        warnText = "Maximum dose reached — never give more than 1,000 mg per dose.";
      }
    }

    resultLayer.innerHTML =
      '<div class="heal-dose">' +
        '<div class="heal-dose-cap">Give this amount</div>' +
        '<div class="heal-dose-cols">' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + mlText + '<span class="heal-unit"> mL</span></div><div class="heal-dose-lbl">liquid</div></div>' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + mgText + '<span class="heal-unit"> mg</span></div><div class="heal-dose-lbl">amoxicillin</div></div>' +
        '</div>' +
        '<div class="heal-dose-freq">' + freqText + '</div>' +
        (warnText ? '<div class="heal-dose-warn">' + warnText + '</div>' : "") +
      '</div>';
    output.dataset.state = "result";
  }

  weightEl.addEventListener("input", render);
  indicationEl.addEventListener("change", render);
  strengthEl.addEventListener("change", render);
};
