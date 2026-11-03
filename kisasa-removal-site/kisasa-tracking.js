/*
 * kisasa-tracking.js
 *
 * Keeps the UTM tags and the first landing page when a visitor moves from
 * index.html to removal-assessment.html. Load this file on BOTH pages.
 *
 * What it does:
 * 1. Reads utm_source / utm_medium / utm_campaign / utm_content from the URL
 *    and remembers them for the browser session.
 * 2. Remembers the first page of the visit (usually index.html).
 * 3. Adds the UTM tags to links that go to index.html or removal-assessment.html.
 * 4. If a page is opened without UTMs but they were saved, puts them back in
 *    the address bar so the existing getUTM() in removal-assessment.html finds them.
 */
(function () {
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  var STORE = "kisasaTracking";

  function currentPage() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function read() {
    try {
      return JSON.parse(sessionStorage.getItem(STORE)) || {};
    } catch (e) {
      return {};
    }
  }

  function write(data) {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(data));
    } catch (e) {}
  }

  var params = new URLSearchParams(window.location.search);
  var saved = read();

  var hasFreshUtm = KEYS.some(function (k) {
    return params.get(k);
  });

  if (hasFreshUtm) {
    // A new campaign click replaces older tags and restarts the landing page.
    KEYS.forEach(function (k) {
      saved[k] = params.get(k) || "";
    });
    saved.landingPage = currentPage();
  }

  if (!saved.landingPage) {
    saved.landingPage = currentPage();
  }

  write(saved);

  function decorateLinks() {
    var links = document.querySelectorAll(
      'a[href*="removal-assessment"], a[href*="index.html"]'
    );

    Array.prototype.forEach.call(links, function (a) {
      var href = a.getAttribute("href") || "";

      if (
        /^(https?:)?\/\//i.test(href) ||
        /^(mailto|tel):/i.test(href) ||
        href.charAt(0) === "#"
      ) {
        return;
      }

      var hashIndex = href.indexOf("#");
      var hash = hashIndex > -1 ? href.slice(hashIndex) : "";
      var base = hashIndex > -1 ? href.slice(0, hashIndex) : href;

      var extra = [];
      KEYS.forEach(function (k) {
        if (saved[k] && base.indexOf(k + "=") === -1) {
          extra.push(k + "=" + encodeURIComponent(saved[k]));
        }
      });

      if (!extra.length) return;

      a.setAttribute(
        "href",
        base + (base.indexOf("?") > -1 ? "&" : "?") + extra.join("&") + hash
      );
    });
  }

  function restoreAddressBar() {
    try {
      if (!window.history || !history.replaceState) return;

      var p = new URLSearchParams(window.location.search);
      var changed = false;

      KEYS.forEach(function (k) {
        if (saved[k] && !p.get(k)) {
          p.set(k, saved[k]);
          changed = true;
        }
      });

      if (changed) {
        history.replaceState(
          null,
          "",
          window.location.pathname + "?" + p.toString() + window.location.hash
        );
      }
    } catch (e) {}
  }

  function init() {
    decorateLinks();
    restoreAddressBar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.KisasaTracking = {
    landingPage: function () {
      return read().landingPage || currentPage();
    }
  };
})();
