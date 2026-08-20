// HEAL Paracetamol dose calculator (children, weight-based, NZ Formulary).
// Renders into any container. Used by paracetamol/index.html (iframe)
// and paracetamol/embed.js (script tag + shadow DOM).
window.healRenderParacetamol = function (container) {
  "use strict";

  container.innerHTML =
    '<div class="heal-calc">' +
      '<div class="heal-head"><h2 class="heal-title">Paracetamol dose — children</h2></div>' +
      '<p class="heal-sub">Weight-based · NZ Formulary · ages 1&nbsp;mth–18&nbsp;yr</p>' +

      '<form novalidate>' +
        '<div class="heal-field">' +
          '<label for="heal-p-weight">Child\u2019s weight <span class="heal-u">(kg)</span></label>' +
          '<input type="number" id="heal-p-weight" inputmode="decimal" min="0" max="150" step="0.1" placeholder="e.g. 14.5" autocomplete="off">' +
        '</div>' +
        '<div class="heal-field">' +
          '<label for="heal-p-strength">Liquid strength</label>' +
          '<select id="heal-p-strength">' +
            '<option value="24">Paracetamol 120 mg / 5 mL</option>' +
            '<option value="50">Paracetamol 250 mg / 5 mL</option>' +
          '</select>' +
        '</div>' +
      '</form>' +

      '<div class="heal-output" data-state="empty" role="status" aria-live="polite">' +
        '<div class="heal-layer heal-layer-empty">Enter a weight to see the recommended single dose.</div>' +
        '<div class="heal-layer heal-layer-result"></div>' +
      '</div>' +

      '<p class="heal-freq">Give this amount every <b>4–6&nbsp;hours</b>, up to a <b>maximum</b> of <b>4</b> doses in <b>24&nbsp;hours</b>.</p>' +

      '<button type="button" class="heal-advice-link" aria-haspopup="dialog">General dosing advice</button>' +

      '<p class="heal-disc">' +
        'General guide only, not medical advice — always read the label. Unsure, or child under 1&nbsp;month? ' +
        'Call <a href="tel:0800611116">Healthline 0800&nbsp;611&nbsp;116</a>. Emergency&nbsp;111.' +
      '</p>' +

      '<p class="heal-footer">Brought to you by <a href="https://healthify.nz" target="_blank" rel="noopener">Healthify</a></p>' +

      '<dialog class="heal-advice" aria-labelledby="heal-p-advice-title">' +
        '<div class="heal-m-head">' +
          '<h2 id="heal-p-advice-title">General dosing advice</h2>' +
          '<button type="button" class="heal-m-close" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="heal-m-body">' +
          '<ul>' +
            '<li>Dose by the child\u2019s <strong>weight</strong> (about 15&nbsp;mg per kg), not by age, wherever possible.</li>' +
            '<li>Give a dose only when needed, <strong>every 4–6 hours</strong>, and no more than <strong>4 doses in 24 hours</strong>.</li>' +
            '<li>Never exceed <strong>1&nbsp;gram (1000&nbsp;mg) per dose</strong>, even for larger children.</li>' +
            '<li>Do not use for more than <strong>48 hours</strong> without advice from a doctor, nurse or pharmacist.</li>' +
            '<li>Check that other medicines (e.g. cold &amp; flu products) don\u2019t also contain paracetamol.</li>' +
            '<li>Use the oral syringe or measure provided, and write down the time of each dose.</li>' +
            '<li>Take extra care if the child is significantly underweight, or has liver or kidney problems — ask a pharmacist.</li>' +
            '<li>If too much has been taken, ring the <strong>National Poisons Centre 0800&nbsp;764&nbsp;766</strong> straight away, even if the child seems well.</li>' +
          '</ul>' +
        '</div>' +
      '</dialog>' +
    '</div>';

  var MG_PER_KG = 15, MAX_DOSE_MG = 1000;
  var weightEl = container.querySelector("#heal-p-weight");
  var strengthEl = container.querySelector("#heal-p-strength");
  var output = container.querySelector(".heal-output");
  var emptyLayer = container.querySelector(".heal-layer-empty");
  var resultLayer = container.querySelector(".heal-layer-result");

  // Standard rounding (halves up). 1-dp mg matches the reference exactly;
  // mL may differ from the reference by a harmless 0.1 mL on float edge cases.
  function round(n, dp) {
    var f = Math.pow(10, dp);
    return Math.round(n * f) / f;
  }

  function render() {
    var w = parseFloat(weightEl.value);
    var mgPerMl = parseFloat(strengthEl.value);

    if (!(w > 0) || w > 150) {
      emptyLayer.textContent = (w > 150)
        ? "Please check the weight entered."
        : "Enter a weight to see the recommended single dose.";
      output.dataset.state = "empty";
      return;
    }

    var raw = w * MG_PER_KG;
    var capped = raw > MAX_DOSE_MG;
    var doseMg = capped ? MAX_DOSE_MG : raw;
    var doseMl = doseMg / mgPerMl;

    resultLayer.innerHTML =
      '<div class="heal-dose">' +
        '<div class="heal-dose-cap">Give this amount</div>' +
        '<div class="heal-dose-cols">' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + round(doseMl, 1) + '<span class="heal-unit"> mL</span></div><div class="heal-dose-lbl">liquid</div></div>' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + round(doseMg, 1) + '<span class="heal-unit"> mg</span></div><div class="heal-dose-lbl">powder</div></div>' +
        '</div>' +
        (capped ? '<div class="heal-dose-warn">Maximum single dose reached — never give more than 1&nbsp;g (1000&nbsp;mg) per dose.</div>' : "") +
      '</div>';
    output.dataset.state = "result";
  }

  weightEl.addEventListener("input", render);
  strengthEl.addEventListener("change", render);

  // Modal
  var dlg = container.querySelector("dialog.heal-advice");
  var openBtn = container.querySelector(".heal-advice-link");
  var closeBtn = container.querySelector(".heal-m-close");
  openBtn.addEventListener("click", function () {
    if (typeof dlg.showModal === "function") { dlg.showModal(); }
    else { dlg.setAttribute("open", ""); }
  });
  closeBtn.addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) {
    // click on backdrop (outside the dialog content) closes
    var r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
      dlg.close();
    }
  });
};
