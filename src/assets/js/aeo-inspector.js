/* =============================================================
   AEO Inspector — hover annotation layer
   Each [data-aeo-id] element gets an ⓘ badge. Hovering or
   focusing it shows a formatted tooltip explaining the AEO
   purpose of that element.
   ============================================================= */

(function () {
  'use strict';

  /* ── Content map — keyed by data-aeo-id ─────────────────── */
  var CONTENT = {

    /* SESSION */
    'session-header': {
      label: 'Event schema',
      html: '<strong>Schema.org Event (sub-event)</strong>'
          + '<p>The entire header block is mapped to structured Event JSON-LD. This tells AI engines that this page describes a named, dated, located conference session — not just an article about a topic.</p>'
          + '<ol>'
          + '<li><strong>Title → Event.name</strong> — used to match queries like "What sessions are at Airspace World 2026?"</li>'
          + '<li><strong>Summary → Event.description</strong> — the pull-quote AI engines surface in answer panels</li>'
          + '<li><strong>Day + time → Event.startDate</strong> — enables scheduling queries ("What time is the SESAR session?")</li>'
          + '<li><strong>Room → Event.location</strong> — grounds the event in a physical place, improving entity confidence</li>'
          + '</ol>'
    },
    'session-title': {
      label: 'Session title entity',
      html: '<strong>Primary entity name</strong>'
          + '<p>The H1 is the canonical name of this session as a knowledge-graph entity. AI engines match it against agenda queries and index it as a named Event.</p>'
          + '<ol>'
          + '<li><strong>Consistency is critical</strong> — the title must match exactly in JSON-LD, the sessions index, and any speaker pages that link here</li>'
          + '<li><strong>Front-load keywords</strong> — AI engines weight the first 3–5 words most heavily for topic matching</li>'
          + '<li><strong>Avoid abbreviations</strong> — spell out "SESAR" as "SESAR (Single European Sky ATM Research)" at least once</li>'
          + '</ol>'
    },
    'session-meta': {
      label: 'Structured metadata',
      html: '<strong>Machine-readable key/value pairs</strong>'
          + '<p>Day, time, room, and speaker data sit in a definition list — not buried in prose. AI engines extract structured metadata far more reliably than parsing sentences.</p>'
          + '<ol>'
          + '<li><strong>Day + time</strong> — answers "when is this?" without reading the whole page</li>'
          + '<li><strong>Room</strong> — a named physical location that strengthens the Event entity</li>'
          + '<li><strong>Speakers</strong> — creates a co-occurrence link between the session entity and each speaker entity</li>'
          + '</ol>'
    },
    'session-article': {
      label: 'Body content — citation targets',
      html: '<strong>Where AI citation happens</strong>'
          + '<p>Each H2 heading in this article is a discrete citation candidate. AI engines treat H2 + the first paragraph beneath it as a self-contained answer unit.</p>'
          + '<ol>'
          + '<li><strong>State the answer first</strong> — put the key finding in sentence one, before elaborating</li>'
          + '<li><strong>FAQ headings outperform narrative headings</strong> — "What will this session cover?" gets cited more than "Session overview"</li>'
          + '<li><strong>Bullet points</strong> — AI engines extract lists verbatim; each bullet should be a complete, standalone fact</li>'
          + '<li><strong>2–4 sentence answers</strong> — longer prose is less likely to be quoted directly</li>'
          + '</ol>'
    },
    'session-cta': {
      label: 'Internal link equity',
      html: '<strong>Entity graph cross-links</strong>'
          + '<p>These links to /sessions/ and /themes/ pass topical authority through the hub. AI engines use internal link patterns to determine which pages are the most authoritative source for a topic cluster.</p>'
          + '<ol>'
          + '<li><strong>More inbound links = higher authority</strong> — every session page linking to /sessions/ reinforces the index as the canonical agenda source</li>'
          + '<li><strong>Theme cross-links</strong> — connecting sessions to themes creates entity co-occurrence signals</li>'
          + '</ol>'
    },

    /* SPEAKER */
    'speaker-header': {
      label: 'Person schema',
      html: '<strong>Schema.org Person</strong>'
          + '<p>This header maps to Person JSON-LD. The speaker\'s name, job title, and organisation become structured, machine-readable entities — not just text on a page.</p>'
          + '<ol>'
          + '<li><strong>Person.name</strong> — the canonical identifier; must match exactly across all pages and JSON-LD</li>'
          + '<li><strong>Person.jobTitle</strong> — signals expertise domain to AI engines</li>'
          + '<li><strong>Person.worksFor → Organisation</strong> — links the person to an institutional entity, strengthening credibility signals</li>'
          + '</ol>'
    },
    'speaker-title': {
      label: 'Named entity — speaker',
      html: '<strong>Canonical entity identifier</strong>'
          + '<p>The speaker\'s name in the H1 is the anchor for all entity consolidation across the hub. AI engines build a knowledge-graph entry for this person by matching occurrences across pages.</p>'
          + '<ol>'
          + '<li><strong>Exact match</strong> — "Dr Jane Smith" on this page must be "Dr Jane Smith" on every session page and in JSON-LD — never "J. Smith" or "Jane Smith (EUROCONTROL)"</li>'
          + '<li><strong>Disambiguation</strong> — if the name is common, the role + organisation line below does the disambiguating</li>'
          + '</ol>'
    },
    'speaker-role': {
      label: 'Role + organisation',
      html: '<strong>Expertise and affiliation signals</strong>'
          + '<p>Job title and organisation are the two attributes AI engines surface most often when identifying subject-matter experts. Consistent phrasing here and in the JSON-LD reinforces entity disambiguation.</p>'
          + '<ol>'
          + '<li><strong>Use the full official title</strong> — "Director General, CANSO" not "DG"</li>'
          + '<li><strong>Organisation name</strong> — spell it out in full; abbreviations like "CANSO" should appear alongside "Civil Air Navigation Services Organisation" at least once</li>'
          + '</ol>'
    },
    'speaker-article': {
      label: 'Speaker bio content',
      html: '<strong>Expertise + session cross-links</strong>'
          + '<p>The bio article has two AEO jobs: establish the speaker\'s expertise domain, and link bidirectionally to their sessions.</p>'
          + '<ol>'
          + '<li><strong>First sentence = most cited</strong> — open with the speaker\'s primary area of expertise, not a career history</li>'
          + '<li><strong>Areas of responsibility bullets</strong> — each bullet is a topical keyword; AI engines use these to match the speaker to subject queries</li>'
          + '<li><strong>ASW 2026 sessions section</strong> — bidirectional links between speaker ↔ session are the strongest entity co-occurrence signal in the hub</li>'
          + '<li><strong>About [Organisation]</strong> — institutional context that helps AI engines resolve the organisation as a known entity</li>'
          + '</ol>'
    },
    'speaker-cta': {
      label: 'Internal link equity',
      html: '<strong>Topical authority cross-links</strong>'
          + '<p>Links to /speakers/ and /sessions/ strengthen the hub\'s overall authority on the topic cluster "Airspace World 2026 speakers".</p>'
          + '<ol>'
          + '<li><strong>Speaker index inbound links</strong> — every speaker page pointing to /speakers/ makes the index the canonical source for "who is speaking at ASW 2026?"</li>'
          + '</ol>'
    },

    /* THEME */
    'theme-header': {
      label: 'Theme entity',
      html: '<strong>Topical entity anchor</strong>'
          + '<p>This header establishes the page\'s primary knowledge-graph entity. Each theme (e.g. "Sustainable Aviation", "Digital ATM Transformation") is a named concept AI engines use to cluster related sessions and speakers.</p>'
          + '<ol>'
          + '<li><strong>Theme name must be consistent</strong> — exactly the same phrase in this H1, all session frontmatter that references this theme, and all internal links</li>'
          + '<li><strong>Theme = topic cluster</strong> — AI engines use the theme page as the hub for all sub-entities (sessions, speakers) tagged to it</li>'
          + '<li><strong>Summary sentence</strong> — the paragraph below H1 maps to the entity\'s description; keep it to one clear, keyword-rich sentence</li>'
          + '</ol>'
    },
    'theme-title': {
      label: 'Topical authority anchor',
      html: '<strong>Primary keyword entity</strong>'
          + '<p>The theme name in H1 is the page\'s topical authority anchor. AI engines look for consistent repetition of this phrase across the page, in linked session titles, and in the sitemap.</p>'
          + '<ol>'
          + '<li><strong>Depth of coverage</strong> — the more sessions and speakers linked to this theme, the stronger its authority signal</li>'
          + '<li><strong>Keyword consistency</strong> — every session that belongs to this theme should use the exact theme name phrase somewhere in its title or body</li>'
          + '</ol>'
    },
    'theme-article': {
      label: 'FAQ + entity content',
      html: '<strong>Where topical authority is built</strong>'
          + '<p>This article is the primary AEO content block. Structure it so every H2 is a question an ATM professional might ask an AI engine.</p>'
          + '<ol>'
          + '<li><strong>FAQ headings</strong> — "What is…?", "Why does…?", "How will…?" — each H2 + its first paragraph is a discrete citation unit</li>'
          + '<li><strong>Answer first</strong> — state the key point in the first sentence after the H2; elaborate in sentences 2–3</li>'
          + '<li><strong>Keep answers to 2–4 sentences</strong> — AI engines quote shorter, self-contained answers more reliably than long paragraphs</li>'
          + '<li><strong>Key sessions + speakers lists</strong> — entity co-occurrence: AI engines infer topical relevance from which names and sessions appear on the same page</li>'
          + '<li><strong>ASW 2025 cross-link</strong> — historical context signals that this site has longitudinal authority on the topic, not just a one-year presence</li>'
          + '</ol>'
    },
    'theme-cta': {
      label: 'Hub navigation links',
      html: '<strong>Internal link skeleton</strong>'
          + '<p>These cross-links are the hub\'s internal link graph. Every theme page linking to the sessions index — and vice versa — creates a tightly connected entity cluster.</p>'
          + '<ol>'
          + '<li><strong>More connections = higher authority</strong> — AI engines use link graphs to determine which site has the most comprehensive coverage of a topic</li>'
          + '<li><strong>Anchor text matters</strong> — "All ASW 2026 themes" is a stronger anchor than "click here" because it repeats the target page\'s primary keyword</li>'
          + '</ol>'
    },

    /* INSIGHT */
    'insight-header': {
      label: 'Article schema',
      html: '<strong>Schema.org Article</strong>'
          + '<p>This header maps to Article JSON-LD. A dateable, attributable article is a more trusted citation source than an undated page — AI engines can assess recency and relevance.</p>'
          + '<ol>'
          + '<li><strong>Article.headline</strong> — the H1, used verbatim in citations; write it as a clear statement of the finding</li>'
          + '<li><strong>Article.description</strong> — the summary paragraph; used as the pull-quote in AI answer panels</li>'
          + '<li><strong>Article.datePublished</strong> — the date in the eyebrow; recency is a ranking factor for AI citation</li>'
          + '<li><strong>Article.publisher</strong> — Maxifi Digital is the named publisher entity, building long-term attribution</li>'
          + '</ol>'
    },
    'insight-title': {
      label: 'Article headline',
      html: '<strong>Headline = citation anchor</strong>'
          + '<p>AI engines frequently quote article headlines verbatim when citing content. Write the H1 as a clear, standalone statement of the article\'s core finding or argument.</p>'
          + '<ol>'
          + '<li><strong>Lead with the finding</strong> — "FAQs outperform blog posts for AI citation" beats "A look at content formats for AEO"</li>'
          + '<li><strong>Include the key entity</strong> — mention the primary topic (e.g. "AI citation", "SESAR", "ATM") in the headline itself</li>'
          + '<li><strong>Avoid clickbait</strong> — AI engines penalise headlines that don\'t match the article body</li>'
          + '</ol>'
    },
    'insight-summary': {
      label: 'Article description',
      html: '<strong>Pull-quote and meta description</strong>'
          + '<p>This summary paragraph maps to Article.description in JSON-LD and is also used as the page meta description. AI engines pull this text verbatim when citing the article.</p>'
          + '<ol>'
          + '<li><strong>One complete sentence</strong> — must be self-contained; a reader should understand the article\'s value without reading anything else</li>'
          + '<li><strong>Under 160 characters</strong> — anything longer is truncated in search snippets and AI answer panels</li>'
          + '<li><strong>No fluff</strong> — avoid "In this article we explore…"; state the finding directly</li>'
          + '</ol>'
    },
    'insight-article': {
      label: 'Article body',
      html: '<strong>Citation content structure</strong>'
          + '<p>Structure this article so each H2 section is a self-contained answer unit. The first paragraph after each H2 is the most likely text to be cited by an AI engine.</p>'
          + '<ol>'
          + '<li><strong>Answer first</strong> — state the key finding immediately after the H2, before any context or caveats</li>'
          + '<li><strong>FAQ schema opportunity</strong> — any H2 + answer pair can be wrapped in FAQPage JSON-LD to unlock rich results in Google and increase Perplexity citation rate</li>'
          + '<li><strong>Bullet points</strong> — AI engines extract lists verbatim; each bullet should be a complete, standalone fact</li>'
          + '<li><strong>Link to theme pages</strong> — cross-linking to /themes/ creates topical clustering and reinforces hub authority</li>'
          + '</ol>'
    },
    'insight-cta': {
      label: 'Related content links',
      html: '<strong>Topical clustering via internal links</strong>'
          + '<p>Linking insights back to /insights/ and /themes/ creates co-citation patterns. AI engines use these to determine which site is the authoritative source for a topic cluster.</p>'
          + '<ol>'
          + '<li><strong>Co-citation signal</strong> — if multiple insights link to the same theme page, that theme gains authority as the canonical reference</li>'
          + '<li><strong>Insight index authority</strong> — every insight linking to /insights/ makes the index page the hub for "analysis of Airspace World 2026"</li>'
          + '</ol>'
    }
  };

  var STORAGE_KEY = 'aeo-inspector-active';
  var tooltip, toggleBtn;

  /* ── Bootstrap ──────────────────────────────────────────── */
  function init () {
    var annotated = document.querySelectorAll('[data-aeo-id]');
    if (!annotated.length) return;

    buildTooltip();
    buildToggle();
    injectBadges(annotated);

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
      activate(!document.body.classList.contains('aeo-active'));
    });
    document.body.appendChild(toggleBtn);
  }

  /* ── Inject ⓘ badge into each annotated element ─────────── */
  function injectBadges (nodes) {
    nodes.forEach(function (el) {
      var id      = el.getAttribute('data-aeo-id');
      var content = CONTENT[id];
      if (!content) return;

      var style = window.getComputedStyle(el);
      if (style.position === 'static') el.style.position = 'relative';

      var badge = document.createElement('button');
      badge.className = 'aeo-badge';
      badge.setAttribute('aria-label', 'AEO annotation: ' + content.label);
      badge.setAttribute('type', 'button');
      badge.textContent = 'ⓘ';

      badge.addEventListener('mouseenter', function (e) { showTip(e, content.html); });
      badge.addEventListener('focus',      function (e) { showTip(e, content.html); });
      badge.addEventListener('mouseleave', hideTip);
      badge.addEventListener('blur',       hideTip);

      el.appendChild(badge);
    });
  }

  /* ── Tooltip positioning ────────────────────────────────── */
  function showTip (e, html) {
    tooltip.innerHTML = html;
    tooltip.classList.add('aeo-tooltip--visible');

    var badge   = e.currentTarget;
    var bRect   = badge.getBoundingClientRect();
    var tRect   = tooltip.getBoundingClientRect();
    var scrollY = window.scrollY || document.documentElement.scrollTop;
    var scrollX = window.scrollX || document.documentElement.scrollLeft;

    var top  = bRect.top  + scrollY - tRect.height - 12;
    var left = bRect.left + scrollX + (bRect.width / 2) - (tRect.width / 2);

    left = Math.max(12, Math.min(window.innerWidth - tRect.width - 12, left));

    if (top < scrollY + 8) {
      top = bRect.bottom + scrollY + 12;
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

  /* ── Init ───────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
