// HEAL PHQ-9 depression screening questionnaire.
// Content matches the Healthify reference (PHQ-9 is public domain).
// Renders into any container. Used by phq9/index.html (iframe)
// and phq9/embed.js (script tag + shadow DOM).
window.healRenderPHQ9 = function (container) {
  "use strict";

  var QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself in some way",
  ];
  var OPTIONS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
  var FUNCTION_OPTIONS = ["Not at all", "Somewhat difficult", "Very difficult", "Extremely difficult"];
  var FUNCTION_WORDS = ["not at all difficult", "somewhat difficult", "very difficult", "extremely difficult"];

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

  function questionHtml(index, text, options, name) {
    var h = '<fieldset class="heal-q" data-q="' + index + '"><legend>' + (index + 1) + ". " + text + "</legend><div class=\"heal-opts\">";
    for (var v = 0; v < options.length; v++) {
      h += '<label><input type="radio" name="' + name + '" value="' + v + '"> ' + options[v] + "</label>";
    }
    return h + "</div></fieldset>";
  }

  var form = '<form novalidate>';
  for (var i = 0; i < QUESTIONS.length; i++) {
    form += questionHtml(i, QUESTIONS[i], OPTIONS, "heal-q" + i);
  }
  form += questionHtml(9, "How difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?", FUNCTION_OPTIONS, "heal-qf");
  form += "</form>";

  container.innerHTML =
    '<div class="heal-calc">' +
      '<div class="heal-head"><h2 class="heal-title">PHQ-9 depression screening</h2></div>' +
      '<p class="heal-sub">Over the last 2 weeks, how often have you been bothered by the following problems?</p>' +
      form +
      '<p class="heal-error" hidden>Please answer every question.</p>' +
      '<button type="button" class="heal-btn">See my result</button>' +
      '<div class="heal-phq9-result" aria-live="polite"></div>' +
      '<p class="heal-disc">Your answers stay on this page — nothing is recorded or sent. ' +
        "This is a screening tool, not a diagnosis; only a trained health professional can diagnose depression.</p>" +
      '<p class="heal-disc">Source: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.</p>' +
      '<p class="heal-footer">Brought to you by <a href="https://healthify.nz" target="_blank" rel="noopener">Healthify</a></p>' +
    '</div>';

  var errorEl = container.querySelector(".heal-error");
  var resultEl = container.querySelector(".heal-phq9-result");
  var submitBtn = container.querySelector(".heal-btn");

  function answerFor(name) {
    var checked = container.querySelector('input[name="' + name + '"]:checked');
    return checked ? parseInt(checked.value, 10) : null;
  }

  function supportHtml() {
    return '<div class="heal-support">' +
      "<strong>Get support</strong>" +
      "If you would like to talk to someone, try one of these free helplines as a first step, or contact your doctor." +
      "<ul>" +
        '<li><a href="tel:1737">1737</a> — call or text, 24/7, trained counsellor</li>' +
        '<li>Depression Helpline — <a href="tel:0800111757">0800 111 757</a></li>' +
        '<li>Lifeline — <a href="tel:0800543354">0800 543 354</a></li>' +
        '<li>Samaritans — <a href="tel:0800726666">0800 726 666</a></li>' +
        '<li>Youthline — <a href="tel:0800376633">0800 376 633</a></li>' +
      "</ul>" +
      'For mental health emergencies, contact your local crisis team or call <a href="tel:111">111</a>.' +
    "</div>";
  }

  submitBtn.addEventListener("click", function () {
    var score = 0;
    var missing = [];
    var selfHarm = false;
    var i, a;

    for (i = 0; i < QUESTIONS.length; i++) {
      a = answerFor("heal-q" + i);
      var fs = container.querySelector('fieldset[data-q="' + i + '"]');
      if (a === null) {
        missing.push(i);
        fs.classList.add("heal-q--missing");
      } else {
        fs.classList.remove("heal-q--missing");
        score += a;
        if (i === 8 && a > 0) selfHarm = true;
      }
    }
    var func = answerFor("heal-qf");
    var funcFs = container.querySelector('fieldset[data-q="9"]');
    if (func === null) {
      missing.push(9);
      funcFs.classList.add("heal-q--missing");
    } else {
      funcFs.classList.remove("heal-q--missing");
    }

    if (missing.length) {
      errorEl.hidden = false;
      resultEl.innerHTML = "";
      container.querySelector('fieldset[data-q="' + missing[0] + '"]').scrollIntoView({ block: "center" });
      return;
    }
    errorEl.hidden = true;

    var b = band(score);
    resultEl.innerHTML =
      '<div class="heal-dose" style="height:auto;margin-top:11px;">' +
        '<div class="heal-dose-cap">Your PHQ-9 result</div>' +
        '<div class="heal-dose-cols">' +
          '<div class="heal-dose-col"><div class="heal-dose-big">' + score + '<span class="heal-unit"> / 27</span></div>' +
          '<div class="heal-dose-lbl ' + b.cls + '"><strong>' + b.label + "</strong></div></div>" +
        "</div>" +
      "</div>" +
      '<p class="heal-explain">' + b.text + "</p>" +
      '<p class="heal-explain">You find it ' + FUNCTION_WORDS[func] + " to complete general life tasks (not included in your score).</p>" +
      (selfHarm
        ? '<p class="heal-alert">You indicated thoughts of hurting yourself. Please speak to a trusted friend or family member, or call one of the numbers below, immediately. If you are in immediate danger, call <a href="tel:111">111</a>.</p>'
        : "") +
      supportHtml() +
      '<button type="button" class="heal-btn heal-btn--secondary">Start again</button>';

    resultEl.querySelector(".heal-btn").addEventListener("click", function () {
      var radios = container.querySelectorAll('input[type="radio"]');
      for (var r = 0; r < radios.length; r++) radios[r].checked = false;
      resultEl.innerHTML = "";
      container.querySelector(".heal-title").scrollIntoView({ block: "start" });
    });

    resultEl.scrollIntoView({ block: "nearest" });
  });
};
