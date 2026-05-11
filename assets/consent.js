/*
 * Arxyne consent shim — UK GDPR + PECR compliant
 *
 * Behaviour:
 *   - First visit: no analytics scripts load, no cookies set.
 *   - Consent banner shown until user makes an explicit choice.
 *   - Accept = load GA4 (gtag.js with G-L2KSD72508).
 *   - Reject = nothing loads, choice persisted, banner hidden.
 *   - Either choice is stored in localStorage under "arxyne_consent_v1".
 *   - Footer link (data-action="open-consent") reopens the banner.
 *   - Reject is exactly as prominent as Accept (PECR / EDPB).
 *
 * Storage shape:
 *   { v: 1, analytics: true|false, ts: "ISO-8601" }
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'arxyne_consent_v1';
  var GA4_ID = 'G-L2KSD72508';

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1) return parsed;
      return null;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 1,
        analytics: !!analytics,
        ts: new Date().toISOString()
      }));
    } catch (e) { /* private mode etc — banner just reappears next visit */ }
  }

  function loadGA4() {
    if (window.__arxyneGAloaded) return;
    window.__arxyneGAloaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    // anonymize_ip is automatic on GA4; flag retained for clarity.
    gtag('config', GA4_ID, { anonymize_ip: true });
  }

  function injectBanner() {
    if (document.getElementById('arxyne-consent-banner')) return;
    var html = ''
      + '<div id="arxyne-consent-banner" role="dialog" aria-live="polite" '
      + 'aria-label="Cookie consent" style="'
      + 'position:fixed;left:1rem;right:1rem;bottom:1rem;z-index:9999;'
      + 'max-width:760px;margin:0 auto;background:#111;color:#fff;'
      + 'border:1px solid #00E5FF;border-radius:10px;padding:1.25rem 1.5rem;'
      + 'font-family:Inter,system-ui,sans-serif;font-size:0.92rem;line-height:1.55;'
      + 'box-shadow:0 8px 32px rgba(0,229,255,0.08);'
      + '">'
      + '<p style="margin:0 0 0.85rem 0;color:#ddd;">'
      + 'We use Google Analytics to understand which pages people read on '
      + 'arxyne.com. No analytics cookies are set until you choose. '
      + 'See our <a href="/cookies/" style="color:#00E5FF;text-decoration:underline;">cookie policy</a> '
      + 'and <a href="/privacy/" style="color:#00E5FF;text-decoration:underline;">privacy policy</a>.'
      + '</p>'
      + '<div style="display:flex;gap:0.6rem;flex-wrap:wrap;">'
      + '<button type="button" data-arxyne-consent="accept" style="'
      + 'background:#00E5FF;color:#0A0A0A;border:none;border-radius:6px;'
      + 'padding:0.55rem 1.2rem;font-family:inherit;font-weight:600;'
      + 'font-size:0.9rem;cursor:pointer;">Accept analytics</button>'
      + '<button type="button" data-arxyne-consent="reject" style="'
      + 'background:transparent;color:#00E5FF;border:1px solid #00E5FF;'
      + 'border-radius:6px;padding:0.55rem 1.2rem;font-family:inherit;'
      + 'font-weight:600;font-size:0.9rem;cursor:pointer;">Reject</button>'
      + '</div></div>';
    var holder = document.createElement('div');
    holder.innerHTML = html;
    document.body.appendChild(holder.firstChild);

    document.querySelectorAll('[data-arxyne-consent]').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        var choice = ev.currentTarget.getAttribute('data-arxyne-consent');
        if (choice === 'accept') {
          writeConsent(true);
          loadGA4();
        } else {
          writeConsent(false);
        }
        var el = document.getElementById('arxyne-consent-banner');
        if (el) el.parentNode.removeChild(el);
      });
    });
  }

  function wireFooterReopen() {
    document.querySelectorAll('[data-action="open-consent"]').forEach(function (link) {
      link.addEventListener('click', function (ev) {
        ev.preventDefault();
        injectBanner();
      });
    });
  }

  function start() {
    var c = readConsent();
    if (c && c.analytics) {
      loadGA4();
    } else if (!c) {
      injectBanner();
    }
    wireFooterReopen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
