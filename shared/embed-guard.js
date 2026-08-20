// HEAL Calculators - shared embed guard.
// Requires allowed-domains.js loaded first (sets window.HEAL_ALLOWED_DOMAINS).
//
// Two checks:
//   healEmbedGuard.checkIframe()  - calculator runs inside an iframe
//   healEmbedGuard.checkScript()  - calculator script runs on host page itself
(function (global) {
  "use strict";

  function hostMatches(host, pattern) {
    host = String(host || "").toLowerCase();
    pattern = String(pattern || "").toLowerCase();
    if (!host || !pattern) return false;
    if (pattern.indexOf("*.") === 0) {
      var base = pattern.slice(2);
      return host === base || host.slice(-(base.length + 1)) === "." + base;
    }
    return host === pattern;
  }

  function isAllowedHost(host) {
    var list = global.HEAL_ALLOWED_DOMAINS || [];
    for (var i = 0; i < list.length; i++) {
      if (hostMatches(host, list[i])) return true;
    }
    return false;
  }

  // Host of the page embedding us in an iframe.
  // Returns null when not embedded, or when browser hides the referrer.
  function iframeHost() {
    if (global.self === global.top) return null;
    if (global.location.ancestorOrigins && global.location.ancestorOrigins.length) {
      try {
        return new URL(global.location.ancestorOrigins[0]).hostname;
      } catch (e) { /* fall through */ }
    }
    if (document.referrer) {
      try {
        return new URL(document.referrer).hostname;
      } catch (e) { /* fall through */ }
    }
    return undefined; // embedded, but host unknown -> deny
  }

  global.healEmbedGuard = {
    isAllowedHost: isAllowedHost,

    // Direct visit (not embedded) is always allowed.
    // Embedded with unknown host is denied.
    checkIframe: function () {
      var host = iframeHost();
      if (host === null) return { embedded: false, allowed: true, host: null };
      if (host === undefined) return { embedded: true, allowed: false, host: null };
      return { embedded: true, allowed: isAllowedHost(host), host: host };
    },

    // Script-tag embed: host page is the current page.
    checkScript: function () {
      var host = global.location.hostname;
      return { embedded: true, allowed: isAllowedHost(host), host: host };
    },
  };
})(window);
