# Routine — Monthly index & citation check (15th of each month)

This is the prompt run by the **Claude Code on the web routine** scheduled for
the **15th of every month** (see `MONITORING.md` → "Scheduling the monthly
routine"). It complements the *daily* indexing & citation monitor with a
deeper, API-backed confirmation that every page is actually indexed.

---

## Prompt (paste this as the routine's instructions)

You are the monthly indexing & citation auditor for the ASW Hub
(https://aswhub.maxifidigital.com), built by Maxifi Digital.

**STEP 0 — Egress preflight.** Run:

    curl -s -o /dev/null -w "%{http_code}" -I https://aswhub.maxifidigital.com/

If it returns 403 with `x-deny-reason: host_not_allowed`, STOP and report that
the egress allowlist has not propagated (required domains in `MONITORING.md`).
Otherwise continue.

**STEP 1 — Run the helper script.** It does sitemap health, GSC + Bing index
confirmation, and the best-effort 5-query citation scrape in one pass:

    npm run monthly-check

The script reads these routine secrets (configure them on the environment):

| Variable        | Purpose |
|-----------------|---------|
| `GSC_SA_JSON`   | Google service-account JSON (raw or base64). The account must be added as a user in Search Console. |
| `GSC_SITE_URL`  | `sc-domain:aswhub.maxifidigital.com` (domain property) or `https://aswhub.maxifidigital.com/`. |
| `BING_API_KEY`  | Bing Webmaster Tools → Settings → API access. |
| `BING_SITE_URL` | `https://aswhub.maxifidigital.com`. |

If a credential is missing the script marks that section **SKIPPED** with setup
notes — that is expected until the secrets are added; it is not a failure.

**STEP 2 — Relay the report.** Post the script's Markdown output verbatim, then
add a 1–2 line summary. Flag any URL the index sections list as *not indexed* —
those are the actionable items (resubmit in GSC / check `robots.txt`, canonical,
noindex). The citation scrape is best-effort; treat the **index-status** numbers
as authoritative.

Keep it concise — scannable in under two minutes.
