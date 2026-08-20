// HEAL Pregnancy calculator - script-tag embed.
//
// Host page usage:
//   <div data-heal-calculator="pregnancy"></div>
//   <script src="https://<user>.github.io/<repo>/pregnancy/embed.js"></script>
//
// Renders inside shadow DOM so host styles do not leak in.
// Host domain must be listed in allowed-domains.js.
(function () {
  "use strict";

  var scriptSrc = document.currentScript && document.currentScript.src;
  if (!scriptSrc) return;
  var base = new URL("../", scriptSrc); // repo root

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = url;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function showBlocked(target) {
    var msg = document.createElement("p");
    msg.textContent = "This calculator is not available on this site.";
    msg.style.cssText = "font-family:system-ui,sans-serif;color:#888;padding:12px;";
    target.appendChild(msg);
  }

  function mount(target) {
    var root = target.attachShadow ? target.attachShadow({ mode: "open" }) : target;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("pregnancy/pregnancy.css", base).href;
    var container = document.createElement("div");
    root.appendChild(link);
    root.appendChild(container);
    window.healRenderPregnancy(container);
  }

  function init() {
    var targets = document.querySelectorAll('[data-heal-calculator="pregnancy"]');
    if (!targets.length) return;

    Promise.all([
      loadScript(new URL("allowed-domains.js", base).href),
      loadScript(new URL("pregnancy/pregnancy.js", base).href),
    ])
      .then(function () {
        return loadScript(new URL("shared/embed-guard.js", base).href);
      })
      .then(function () {
        var verdict = window.healEmbedGuard.checkScript();
        targets.forEach(function (target) {
          if (verdict.allowed) {
            mount(target);
          } else {
            showBlocked(target);
          }
        });
      })
      .catch(function () {
        targets.forEach(showBlocked);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
