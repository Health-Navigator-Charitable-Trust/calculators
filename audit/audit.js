// HEAL AUDIT alcohol screening questionnaire (wizard style).
// The 10 AUDIT items and answer options are the WHO instrument (verbatim;
// freely reproducible). Surrounding copy is Healthify's own.
// One question per page, auto-advance, auto-scored. Renders into any
// container. Used by audit/index.html (iframe) and audit/embed.js (script tag).
window.healRenderAUDIT = function (container) {
  "use strict";

  var FREQ = ["Never", "Less than monthly", "Monthly", "Weekly", "Daily or almost daily"];
  var YESNO = [
    { label: "No", pts: 0 },
    { label: "Yes, but not in the last year", pts: 2 },
    { label: "Yes, during the last year", pts: 4 },
  ];
  function pts5(labels) {
    return labels.map(function (label, i) { return { label: label, pts: i }; });
  }

  var STEPS = [
    { text: "How often do you have a drink containing alcohol?",
      opts: pts5(["Never", "Monthly or less", "2-4 times a month", "2-3 times a week", "4 or more times a week"]) },
    { text: "How many drinks containing alcohol do you have on a typical day when you are drinking?",
      opts: pts5(["1 or 2", "3 or 4", "5 or 6", "7 to 9", "10 or more"]) },
    { text: "How often do you have six or more drinks on one occasion?", opts: pts5(FREQ) },
    { text: "How often during the last year have you found that you were not able to stop drinking once you had started?", opts: pts5(FREQ) },
    { text: "How often during the last year have you failed to do what was normally expected of you because of drinking?", opts: pts5(FREQ) },
    { text: "How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?", opts: pts5(FREQ) },
    { text: "How often during the last year have you had a feeling of guilt or remorse after drinking?", opts: pts5(FREQ) },
    { text: "How often during the last year have you been unable to remember what happened the night before because of your drinking?", opts: pts5(FREQ) },
    { text: "Have you or someone else been injured because of your drinking?", opts: YESNO },
    { text: "Has a relative, friend, doctor, or other health care worker been concerned about your drinking or suggested you cut down?", opts: YESNO },
  ];
  var TOTAL = STEPS.length;
  var HELPLINE = 'Alcohol Drug Helpline — <a href="tel:0800787797">0800 787 797</a> (free, confidential, 24/7)';

  function band(score) {
    if (score < 8) return { label: "Low risk", cls: "heal-band-none",
      text: "Your score suggests low-risk drinking, within recommended limits." };
    if (score < 16) return { label: "Hazardous", cls: "heal-band-mild",
      text: "Your score suggests hazardous drinking — your current pattern puts you at risk of alcohol-related harm, even if nothing has gone wrong yet. A brief chat with your GP, or a call to the helpline below, can help with cutting down." };
    if (score < 20) return { label: "Harmful", cls: "heal-band-moderate",
      text: "Your score suggests harmful drinking — alcohol is likely already affecting your physical or mental health. Please talk to your GP, and consider calling the helpline below for support with cutting down." };
    return { label: "Possible dependence", cls: "heal-band-severe",
      text: "Your score suggests possible alcohol dependence. Please see your GP for a proper assessment — treatment works, and support is available. The helpline below is a good first step." };
  }

  container.innerHTML =
    '<div class="heal-calc">' +
      '<div class="heal-head"><h2 class="heal-title">AUDIT alcohol screening</h2></div>' +
      '<p class="heal-sub">Ten quick questions about your drinking over the last year.</p>' +

      '<div class="heal-wiz">' +
        '<div class="heal-wiz-progress">' +
          '<span class="heal-wiz-count" role="status"></span>' +
          '<div class="heal-wiz-track"><div class="heal-wiz-fill"></div></div>' +
        '</div>' +
        '<div class="heal-wiz-body"></div>' +
        '<div class="heal-wiz-nav">' +
          '<button type="button" class="heal-nav-btn heal-wiz-back">&larr; Back</button>' +
          '<button type="button" class="heal-nav-btn heal-wiz-restart">Restart</button>' +
        '</div>' +
      '</div>' +

      '<p class="heal-disc">Your answers stay on this page — nothing is recorded or sent. ' +
        'This is a screening tool, not a diagnosis; only a trained health professional can assess alcohol dependence.</p>' +
      '<p class="heal-disc">The AUDIT was developed by the World Health Organization (Babor et al., 1989) and is validated for adults.</p>' +
      '<p class="heal-footer">Brought to you by <a href="https://healthify.nz" target="_blank" rel="noopener">Healthify</a></p>' +
    '</div>';

  var bodyEl = container.querySelector(".heal-wiz-body");
  var countEl = container.querySelector(".heal-wiz-count");
  var fillEl = container.querySelector(".heal-wiz-fill");
  var backBtn = container.querySelector(".heal-wiz-back");
  var restartBtn = container.querySelector(".heal-wiz-restart");

  var answers = new Array(TOTAL);
  for (var i = 0; i < TOTAL; i++) answers[i] = null;
  var current = 0;
  var timer = null;

  function answeredCount() {
    var n = 0;
    for (var i = 0; i < TOTAL; i++) if (answers[i] !== null) n++;
    return n;
  }

  function setProgress(text, fraction) {
    countEl.textContent = text;
    fillEl.style.width = Math.round(fraction * 100) + "%";
  }

  function renderQuestion() {
    var step = STEPS[current];
    var h = '<div class="heal-wiz-q">' + (current + 1) + ". " + step.text + '</div><div class="heal-wiz-opts">';
    for (var v = 0; v < step.opts.length; v++) {
      h += '<button type="button" class="heal-opt" data-value="' + v + '" aria-pressed="' +
        (answers[current] === v) + '">' + step.opts[v].label + "</button>";
    }
    bodyEl.innerHTML = h + "</div>";
    setProgress("Question " + (current + 1) + " of " + TOTAL, answeredCount() / TOTAL);
    backBtn.hidden = current === 0;

    var opts = bodyEl.querySelectorAll(".heal-opt");
    for (var b = 0; b < opts.length; b++) {
      opts[b].addEventListener("click", function () {
        pick(parseInt(this.getAttribute("data-value"), 10));
      });
    }
  }

  function pick(value) {
    answers[current] = value;
    var opts = bodyEl.querySelectorAll(".heal-opt");
    for (var b = 0; b < opts.length; b++) {
      var isPicked = parseInt(opts[b].getAttribute("data-value"), 10) === value;
      opts[b].setAttribute("aria-pressed", String(isPicked));
      opts[b].classList.toggle("heal-opt--picked", isPicked);
    }
    setProgress("Question " + (current + 1) + " of " + TOTAL, answeredCount() / TOTAL);
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      if (current < TOTAL - 1) {
        current++;
        renderQuestion();
      } else {
        renderResult();
      }
    }, 300);
  }

  function renderResult() {
    var score = 0;
    for (var i = 0; i < TOTAL; i++) score += STEPS[i].opts[answers[i]].pts;
    var b = band(score);

    bodyEl.innerHTML =
      '<div class="heal-dose" style="height:auto;">' +
        '<div class="heal-dose-cap">Your AUDIT result</div>' +
        '<div class="heal-dose-cols">' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + score + '<span class="heal-unit"> / 40</span></div>' +
          '<div class="heal-dose-lbl ' + b.cls + '"><strong>' + b.label + "</strong></div></div>" +
        "</div>" +
      "</div>" +
      '<p class="heal-explain">' + b.text + "</p>" +
      (score >= 8
        ? '<div class="heal-support"><strong>Get support</strong>' + HELPLINE + "</div>"
        : "");
    setProgress("Complete", 1);
    backBtn.hidden = false;
  }

  backBtn.addEventListener("click", function () {
    if (timer) { clearTimeout(timer); timer = null; }
    if (current > 0) {
      current--;
      renderQuestion();
    }
  });

  restartBtn.addEventListener("click", function () {
    if (timer) { clearTimeout(timer); timer = null; }
    for (var i = 0; i < TOTAL; i++) answers[i] = null;
    current = 0;
    renderQuestion();
  });

  renderQuestion();
};
