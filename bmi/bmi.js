// HEAL BMI calculator logic. Renders into any container.
// Used by bmi/index.html (iframe) and bmi/embed.js (script tag + shadow DOM).
window.healRenderBMI = function (container) {
  "use strict";

  container.innerHTML =
    '<div class="heal-calc">' +
      '<h2 class="heal-title">BMI Calculator</h2>' +
      '<div class="heal-units">' +
        '<button type="button" data-unit="metric" aria-pressed="true">Metric</button>' +
        '<button type="button" data-unit="imperial" aria-pressed="false">Imperial</button>' +
      '</div>' +
      '<label>Height (<span class="heal-h-unit">cm</span>)' +
        '<input class="heal-height" type="number" min="0" step="any" inputmode="decimal" placeholder="e.g. 175">' +
      '</label>' +
      '<label>Weight (<span class="heal-w-unit">kg</span>)' +
        '<input class="heal-weight" type="number" min="0" step="any" inputmode="decimal" placeholder="e.g. 70">' +
      '</label>' +
      '<div class="heal-result"><span class="heal-placeholder">Enter height and weight</span></div>' +
    '</div>';

  var unit = "metric";
  var heightEl = container.querySelector(".heal-height");
  var weightEl = container.querySelector(".heal-weight");
  var hUnitEl = container.querySelector(".heal-h-unit");
  var wUnitEl = container.querySelector(".heal-w-unit");
  var resultEl = container.querySelector(".heal-result");
  var unitButtons = container.querySelectorAll(".heal-units button");

  function category(bmi) {
    if (bmi < 18.5) return { label: "Underweight", cls: "heal-cat-underweight" };
    if (bmi < 25) return { label: "Normal weight", cls: "heal-cat-normal" };
    if (bmi < 30) return { label: "Overweight", cls: "heal-cat-overweight" };
    return { label: "Obese", cls: "heal-cat-obese" };
  }

  function update() {
    var h = parseFloat(heightEl.value);
    var w = parseFloat(weightEl.value);
    if (!(h > 0) || !(w > 0)) {
      resultEl.innerHTML = '<span class="heal-placeholder">Enter height and weight</span>';
      return;
    }
    var meters = unit === "metric" ? h / 100 : h * 0.0254;
    var kg = unit === "metric" ? w : w * 0.45359237;
    var bmi = kg / (meters * meters);
    if (!isFinite(bmi) || bmi <= 0) {
      resultEl.innerHTML = '<span class="heal-placeholder">Enter height and weight</span>';
      return;
    }
    var cat = category(bmi);
    resultEl.innerHTML =
      '<div class="heal-bmi-value">' + bmi.toFixed(1) + '</div>' +
      '<div class="heal-bmi-category ' + cat.cls + '">' + cat.label + "</div>";
  }

  function setUnit(next) {
    if (next === unit) return;
    unit = next;
    for (var i = 0; i < unitButtons.length; i++) {
      unitButtons[i].setAttribute("aria-pressed", String(unitButtons[i].dataset.unit === unit));
    }
    hUnitEl.textContent = unit === "metric" ? "cm" : "in";
    wUnitEl.textContent = unit === "metric" ? "kg" : "lb";
    heightEl.placeholder = unit === "metric" ? "e.g. 175" : "e.g. 69";
    weightEl.placeholder = unit === "metric" ? "e.g. 70" : "e.g. 154";
    heightEl.value = "";
    weightEl.value = "";
    update();
  }

  for (var i = 0; i < unitButtons.length; i++) {
    unitButtons[i].addEventListener("click", function () {
      setUnit(this.dataset.unit);
    });
  }
  heightEl.addEventListener("input", update);
  weightEl.addEventListener("input", update);
};
