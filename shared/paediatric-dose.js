// HEAL shared paediatric weight-based dose engine.
// Used by the antibiotic/analgesic calculators; dosing figures match the
// Healthify reference calculators (original: Dr Jeremy Steinberg).
//
// Each calculator passes a config:
// {
//   title, sub, drugLabel,            // display strings
//   strengths: [{ label, mgPerMl, mlPerKgLow, mlPerKgHigh? }],
//   mgPerKgLow, mgPerKgHigh (null -> single dose, not a range),
//   maxMgLow, maxMgHigh (optional, defaults to maxMgLow),
//   freq,                             // e.g. "Three times a day"
//   note (optional)                   // e.g. erythromycin divided doses
// }
window.healRenderPaedDose = function (container, config) {
  "use strict";

  var MAX_WEIGHT = 100;

  var strengthField = "";
  if (config.strengths.length > 1) {
    var opts = "";
    for (var i = 0; i < config.strengths.length; i++) {
      opts += '<option value="' + i + '">' + config.strengths[i].label + "</option>";
    }
    strengthField =
      '<div class="heal-field"><label>Liquid strength' +
        '<select class="heal-pd-strength">' + opts + "</select></label></div>";
  }

  container.innerHTML =
    '<div class="heal-calc">' +
      '<div class="heal-head"><h2 class="heal-title">' + config.title + "</h2></div>" +
      '<p class="heal-sub">' + config.sub + "</p>" +
      '<form novalidate>' +
        '<div class="heal-field">' +
          '<label>Child\u2019s weight <span class="heal-u">(kg)</span>' +
          '<input type="number" class="heal-pd-weight" inputmode="decimal" min="0" max="' + MAX_WEIGHT + '" step="0.1" placeholder="e.g. 14.5" autocomplete="off"></label>' +
        '</div>' +
        strengthField +
      '</form>' +
      '<div class="heal-output" data-state="empty" role="status" aria-live="polite">' +
        '<div class="heal-layer heal-layer-empty">Enter a weight to see the recommended dose.</div>' +
        '<div class="heal-layer heal-layer-result"></div>' +
      '</div>' +
      (config.note ? '<p class="heal-disc"><strong>Note:</strong> ' + config.note + "</p>" : "") +
      '<p class="heal-disc">Calculations must be re-checked and should not be used alone to guide patient care, ' +
        'nor substitute for clinical judgment. For ages 1&nbsp;month to 18&nbsp;years only.</p>' +
      '<p class="heal-footer">Brought to you by <a href="https://healthify.nz" target="_blank" rel="noopener">Healthify</a></p>' +
    '</div>';

  var weightEl = container.querySelector(".heal-pd-weight");
  var strengthEl = container.querySelector(".heal-pd-strength");
  var output = container.querySelector(".heal-output");
  var emptyLayer = container.querySelector(".heal-layer-empty");
  var resultLayer = container.querySelector(".heal-layer-result");

  function roundTo(n, dp) { return parseFloat(n.toFixed(dp)); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function rangeText(low, high) { return low < high ? fmt(low) + " – " + fmt(high) : fmt(low); }

  function render() {
    var w = parseFloat(weightEl.value);
    var s = config.strengths[strengthEl ? parseInt(strengthEl.value, 10) : 0];
    var maxHigh = config.maxMgHigh || config.maxMgLow;

    if (!(w > 0) || w > MAX_WEIGHT) {
      emptyLayer.textContent = (w > MAX_WEIGHT)
        ? "Please enter a weight below " + MAX_WEIGHT + " kg."
        : "Enter a weight to see the recommended dose.";
      output.dataset.state = "empty";
      return;
    }

    var mlText, mgText, warnText = "";
    var lowMg = Math.min(roundTo(config.mgPerKgLow * w, 1), config.maxMgLow);
    var lowMl = Math.min(roundTo(s.mlPerKgLow * w, 1), config.maxMgLow / s.mgPerMl);

    if (config.mgPerKgHigh) {
      var highMg = Math.min(roundTo(config.mgPerKgHigh * w, 0), maxHigh);
      var highMl = Math.min(roundTo(s.mlPerKgHigh * w, 1), maxHigh / s.mgPerMl);
      mlText = rangeText(lowMl, highMl);
      mgText = rangeText(lowMg, highMg);
      if (highMg >= maxHigh) {
        warnText = "Maximum dose reached — never give more than " + fmt(maxHigh) + " mg per dose.";
      }
    } else {
      mlText = fmt(lowMl);
      mgText = fmt(lowMg);
      if (lowMg >= config.maxMgLow) {
        warnText = "Maximum dose reached — never give more than " + fmt(config.maxMgLow) + " mg per dose.";
      }
    }

    resultLayer.innerHTML =
      '<div class="heal-dose">' +
        '<div class="heal-dose-cap">Give this amount</div>' +
        '<div class="heal-dose-cols">' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + mlText + '<span class="heal-unit"> mL</span></div><div class="heal-dose-lbl">liquid</div></div>' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + mgText + '<span class="heal-unit"> mg</span></div><div class="heal-dose-lbl">' + config.drugLabel + '</div></div>' +
        '</div>' +
        '<div class="heal-dose-freq">' + config.freq + '</div>' +
        (warnText ? '<div class="heal-dose-warn">' + warnText + '</div>' : "") +
      '</div>';
    output.dataset.state = "result";
  }

  weightEl.addEventListener("input", render);
  if (strengthEl) strengthEl.addEventListener("change", render);
};
