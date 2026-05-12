/* =============================================================
   AEO Inspector — hover annotation layer
   Activated by the "AEO Layer" toggle button (bottom-right).
   Elements with [data-aeo-label] get an ⓘ badge; hovering or
   focusing the badge shows an explanatory tooltip.
   ============================================================= */

(function () {
  'use strict';

  var STORAGE_KEY = 'aeo-inspector-active';
  var tooltip, toggleBtn;

  /* ── Bootstrap ──────────────────────────────────────────── */
  function init () {
    // Only run on pages that actually have annotations
    var annotated = document.querySelectorAll('[data-aeo-label]');
    if (!annotated.length) return;

    injectStyles();
    buildTooltip();
    buildToggle();
    injectBadges(annotated);

    // Restore last-used state
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      activate(true);
    }
  }

  /* ── Shared tooltip node ────────────────────────────────── */
  function buildTooltip () {
    tooltip = document.createElement('div');
    tooltip.className = 'aeo-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-live', 'polite');
    document.body.appendChild(tooltip);
  }

  /* ── Toggle button ──────────────────────────────────────── */
  function buildToggle () {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'aeo-toggle';
    toggleBtn.setAttribute('aria-pressed', 'false');
    toggleBtn.innerHTML =
      '<span class="aeo-toggle-icon">◈</span>' +
      '<span class="aeo-toggle-label">AEO Layer</span>';
    toggleBtn.addEventListener('click', function () {
      var isActive = document.body.classList.contains('aeo-active');
      activate(!isActive);
    });
    document.body.appendChild(toggleBtn);
  }

  /* ── Inject ⓘ badge into each annotated element ─────────── */
  function injectBadges (nodes) {
    nodes.forEach(function (el) {
      var label = el.getAttribute('data-aeo-label');
      if (!label) return;

      // Mark parent as positioning context
      var style = window.getComputedStyle(el);
      if (style.position === 'static') el.style.position = 'relative';

      var badge = document.createElement('button');
      badge.className = 'aeo-badge';
      badge.setAttribute('aria-label', 'AEO annotation');
      badge.setAttribute('type', 'button');
      badge.textContent = 'ⓘ';

      // Show tooltip on hover / focus
      badge.addEventListener('mouseenter', function (e) { showTip(e, label); });
      badge.addEventListener('focus',      function (e) { showTip(e, label); });
      badge.addEventListener('mouseleave', hideTip);
      badge.addEventListener('blur',       hideTip);

      el.appendChild(badge);
    });
  }

  /* ── Tooltip positioning ────────────────────────────────── */
  function showTip (e, text) {
    tooltip.textContent = text;
    tooltip.classList.add('aeo-tooltip--visible');

    var badge   = e.currentTarget;
    var bRect   = badge.getBoundingClientRect();
    var tRect   = tooltip.getBoundingClientRect();
    var scrollY = window.scrollY || document.documentElement.scrollTop;
    var scrollX = window.scrollX || document.documentElement.scrollLeft;

    // Default: above the badge
    var top  = bRect.top  + scrollY - tRect.height - 10;
    var left = bRect.left + scrollX + (bRect.width / 2) - (tRect.width / 2);

    // Clamp to viewport width
    var minLeft = 8;
    var maxLeft = window.innerWidth - tRect.width - 8;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    // If too close to top, flip below
    if (top < scrollY + 8) {
      top = bRect.bottom + scrollY + 10;
    }

    tooltip.style.top  = top  + 'px';
    tooltip.style.left = left + 'px';
  }

  function hideTip () {
    tooltip.classList.remove('aeo-tooltip--visible');
  }

  /* ── Activate / deactivate ──────────────────────────────── */
  function activate (on) {
    document.body.classList.toggle('aeo-active', on);
    toggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggleBtn.classList.toggle('aeo-toggle--on', on);
    sessionStorage.setItem(STORAGE_KEY, on ? '1' : '0');
    if (!on) hideTip();
  }

  /* ── CSS injected programmatically ──────────────────────── */
  /* (main rules live in layers.css; this adds the dynamic     */
  /*  positioning default so tooltip works before CSS loads)   */
  function injectStyles () {
    var s = document.createElement('style');
    s.textContent =
      '.aeo-tooltip{position:absolute;pointer-events:none;z-index:9999;}';
    document.head.appendChild(s);
  }

  /* ── Init on DOM ready ──────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
