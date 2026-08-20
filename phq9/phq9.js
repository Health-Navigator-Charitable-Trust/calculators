// HEAL PHQ-9 depression screening questionnaire (wizard style).
// Content matches the Healthify reference (PHQ-9 is public domain).
// One question per page, auto-advance, auto-scored. Renders into any
// container. Used by phq9/index.html (iframe) and phq9/embed.js (script tag).
window.healRenderPHQ9 = function (container) {
  "use strict";

  var OPTIONS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
  var FUNCTION_OPTIONS = ["Not at all", "Somewhat difficult", "Very difficult", "Extremely difficult"];
  var FUNCTION_WORDS = ["not at all difficult", "somewhat difficult", "very difficult", "extremely difficult"];

  var STEPS = [
    { text: "Little interest or pleasure in doing things", opts: OPTIONS },
    { text: "Feeling down, depressed, or hopeless", opts: OPTIONS },
    { text: "Trouble falling or staying asleep, or sleeping too much", opts: OPTIONS },
    { text: "Feeling tired or having little energy", opts: OPTIONS },
    { text: "Poor appetite or overeating", opts: OPTIONS },
    { text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", opts: OPTIONS },
    { text: "Trouble concentrating on things, such as reading the newspaper or watching television", opts: OPTIONS },
    { text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", opts: OPTIONS },
    { text: "Thoughts that you would be better off dead or of hurting yourself in some way", opts: OPTIONS },
    { text: "How difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?", opts: FUNCTION_OPTIONS },
  ];
  var TOTAL = STEPS.length;

  function band(score) {
    if (score < 5) return { label: "None–minimal", cls: "heal-band-none",
      text: "Your result falls into the none or minimal range." };
    if (score < 10) return { label: "Mild", cls: "heal-band-mild",
      text: "Your result falls into the mild range. You may wish to monitor your symptoms or speak to a health professional if you are concerned." };
    if (score < 15) return { label: "Moderate", cls: "heal-band-moderate",
      text: "Your result falls into the moderate range. This means you could be experiencing significant distress. You may wish to see your GP." };
    if (score < 20) return { label: "Moderately severe", cls: "heal-band-modsevere",
      text: "Your result falls into the moderately severe range. This means you are probably experiencing significant distress. We strongly recommend you see your GP, and consider calling one of the supports below right now." };
    return { label: "Severe", cls: "heal-band-severe",
      text: "Your result falls into the severe range. This means you are probably experiencing significant distress. We strongly recommend you see your GP, and consider calling one of the supports below right now." };
  }

  container.innerHTML =
    '<div class="heal-calc">' +
      '<div class="heal-head"><h2 class="heal-title">PHQ-9 depression screening</h2></div>' +
      '<p class="heal-sub">Over the last 2 weeks, how often have you been bothered by the following problems?</p>' +

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

      '<div class="heal-support">' +
        '<strong>Get support</strong>' +
        'If you would like to talk to someone, try one of these free helplines as a first step, or contact your doctor.' +
        '<ul>' +
          '<li><a href="tel:1737">1737</a> — call or text, 24/7, trained counsellor</li>' +
          '<li>Depression Helpline — <a href="tel:0800111757">0800 111 757</a></li>' +
          '<li>Lifeline — <a href="tel:0800543354">0800 543 354</a></li>' +
          '<li>Samaritans — <a href="tel:0800726666">0800 726 666</a></li>' +
          '<li>Youthline — <a href="tel:0800376633">0800 376 633</a></li>' +
        '</ul>' +
        'For mental health emergencies, contact your local crisis team or call <a href="tel:111">111</a>.' +
      '</div>' +

      '<p class="heal-disc">Your answers stay on this page — nothing is recorded or sent. ' +
        'This is a screening tool, not a diagnosis; only a trained health professional can diagnose depression.</p>' +
      '<p class="heal-disc">Source: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.</p>' +
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
    var h = '<div class="heal-wiz-q">' + (current + 1) + ". " + step.text + "</div>";
    for (var v = 0; v < step.opts.length; v++) {
      h += '<button type="button" class="heal-opt" data-value="' + v + '" aria-pressed="' +
        (answers[current] === v) + '">' + step.opts[v] + "</button>";
    }
    bodyEl.innerHTML = h;
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
      opts[b].setAttribute("aria-pressed", String(parseInt(opts[b].getAttribute("data-value"), 10) === value));
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
    for (var i = 0; i < 9; i++) score += answers[i] || 0;
    var selfHarm = answers[8] > 0;
    var b = band(score);

    bodyEl.innerHTML =
      '<div class="heal-dose" style="height:auto;">' +
        '<div class="heal-dose-cap">Your PHQ-9 result</div>' +
        '<div class="heal-dose-cols">' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + score + '<span class="heal-unit"> / 27</span></div>' +
          '<div class="heal-dose-lbl ' + b.cls + '"><strong>' + b.label + "</strong></div></div>" +
        "</div>" +
      "</div>" +
      '<p class="heal-explain">' + b.text + "</p>" +
      '<p class="heal-explain">You find it ' + FUNCTION_WORDS[answers[9]] + " to complete general life tasks (not included in your score).</p>" +
      (selfHarm
        ? '<p class="heal-alert">You indicated thoughts of hurting yourself. Please speak to a trusted friend or family member, or call one of the numbers below, immediately. If you are in immediate danger, call <a href="tel:111">111</a>.</p>'
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
