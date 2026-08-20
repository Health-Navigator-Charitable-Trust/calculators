// HEAL Calculators - shared anonymous usage counter (GoatCounter).
// GoatCounter: EU-hosted, open source, no cookies, no personal data.
// Free for non-commercial use. https://www.goatcounter.com
//
// Counts one pageview per calculator load, with the embedding domain
// in the path, e.g. /bmi/healthify.nz or /phq9/direct.
// Blocked embed attempts are counted under /blocked/<calc>/<host>.
//
// SETUP: register a free GoatCounter account and set ENDPOINT below.
window.healAnalytics = (function () {
  "use strict";

  var ENDPOINT = "https://heal-calculators.goatcounter.com/count"; // <-- set your code
  var SCRIPT_SRC = "https://gc.zgo.at/count.js";

  // Where are we running? Script-tag embed -> host page domain.
  // Iframe -> embedding page domain. Direct visit -> "direct".
  function host() {
    if (window.self === window.top) {
      return /github\.io$/.test(window.location.hostname)
        ? "direct"
        : window.location.hostname; // script-tag embed on host page
    }
    if (window.location.ancestorOrigins && window.location.ancestorOrigins.length) {
      try { return new URL(window.location.ancestorOrigins[0]).hostname; } catch (e) { /* fall through */ }
    }
    if (document.referrer) {
      try { return new URL(document.referrer).hostname; } catch (e) { /* fall through */ }
    }
    return "unknown";
  }

  function count(calculator, blocked) {
    if (!window.goatcounter || !window.goatcounter.count) return;
    window.goatcounter.count({
      path: (blocked ? "/blocked/" : "/") + calculator + "/" + host(),
    });
  }

  // Load GoatCounter without its automatic pageview, then count ours.
  function init(calculator, blocked) {
    window.goatcounter = window.goatcounter || {};
    window.goatcounter.no_onload = true;
    if (window.goatcounter.count) {
      count(calculator, blocked);
      return;
    }
    var s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.setAttribute("data-goatcounter", ENDPOINT);
    s.onload = function () { count(calculator, blocked); };
    document.head.appendChild(s);
  }

  return { init: init };
})();
