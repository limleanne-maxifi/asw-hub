# Per-prospect demo configs

Each `{slug}.json` here becomes a page at `/demo/{slug}/`, rendered by
`src/demo.njk`. The template carries **zero client-specific strings** — the whole
page (hero, ticker, preset queries, calculator seeds, CTAs) comes from the config.

## Add a prospect (3 steps)

1. Copy `b2b.json` to `demos/{slug}.json` and fill in `client_name`,
   `sector_label`, `brand_default`, `query_default` and `preset_queries`.
2. Run the mini-audit and replace the `ticker_quotes` placeholders with real
   engine quotes (`cited: true/false`). **Never invent quotes.**
3. Build (`npm run build`) — the page appears at `/demo/{slug}/`. Deploy lands it
   live. Nothing else to change.

## Schema

| Key | Meaning |
| --- | --- |
| `slug` | URL segment (`/demo/{slug}/`). `probe` is reserved (engine proxy). |
| `client_name` | Used in the hero, calculator heading, FAQ answers, `<title>`. |
| `sector_label` | Chip above the hero headline. |
| `ticker_tag` | Optional ticker label; defaults to `{client_name} · AI Visibility`. |
| `ticker_quotes[]` | `{ quote, engine, cited }` — real mini-audit output only. |
| `brand_default` / `query_default` | Pre-fill for the live tester. **Leave `brand_default` empty to disable the auto-run on page load** (each auto-run spends real engine budget). |
| `preset_queries[]` | One-click chips that fill the query box. |
| `competitor_names[]` | Reserved for competitor benchmarking (not yet rendered). |
| `value_defaults` | MAXIFI calculator seeds. Fractions (`A: 0.5` = 50%): `M, A, X, I_influence, F, I_income, X_comp, fee`. |
| `case_links` | `live_hub` + `citation_report` for the proof block. |
| `booking_url` / `snapshot_url` | CTA destinations. |
| `currency_symbol` | Optional, defaults to `$`. |
| `explainer_src` | Optional; defaults to `/demo-assets/visibility-value-explainer.html`. |
| `analytics_goatcounter` | Optional GoatCounter site code — omitted = no external analytics calls at all (events still land in `window.dataLayer`). |
| `faq[]` | Optional `{ q, a }` overrides for the FAQ + FAQPage schema. |

## Explainer video

The embed slot loads `/demo-assets/visibility-value-explainer.html` on click.
Copy the final `Visibility_Value_Model_Explainer.html` (from
`MD_strategic-command-centre`) to `public/demo-assets/visibility-value-explainer.html`
and put `maxifi-logo-black.png` next to it. Until the file exists, the poster
degrades to an "explainer coming soon" note — the page never looks broken.

## Email gate

The gate posts to **Netlify Forms** (form name `demo-gate`) — submissions appear
in the Netlify UI (Site → Forms) and can be wired to email/Zapier notifications
there. No serverless code needed.
