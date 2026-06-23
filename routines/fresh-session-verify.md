# Fresh-session verification prompt — monthly index check

Paste the block below as the **first message in a brand-new Claude Code on the
web session** on the `asw-hub` environment. A fresh session is required because
environment variables and the egress allowlist are only applied at container
start — an already-running session will not see newly-added secrets or hosts.

---

You are verifying the ASW Hub monthly index & citation check
(https://aswhub.maxifidigital.com) after its API credentials and egress
allowlist were configured.

1. **Egress + secrets preflight.** Confirm this fresh session picked up the
   config:
   - `curl -s -o /dev/null -w "%{http_code}\n" -I https://aswhub.maxifidigital.com/` → expect 200.
   - Confirm the secrets are present (names only, never print values). Core
     (index status): `GSC_SA_JSON`, `GSC_SITE_URL`, `BING_API_KEY`,
     `BING_SITE_URL`. Optional (citation/rank probes): `PERPLEXITY_API_KEY`,
     `BING_SEARCH_API_KEY`.
   - Confirm the API hosts are NOT `host_not_allowed`. Core:
     `searchconsole.googleapis.com`, `oauth2.googleapis.com`, `ssl.bing.com`.
     Optional probes: `api.perplexity.ai`, `api.bing.microsoft.com`.

2. **Run the check:** `npm run monthly-check` (run `npm install` first if
   `node_modules` is missing).

3. **Interpret the output:**
   - ✅ PASS = the **Google Search Console** and **Bing Webmaster** sections show
     real counts (e.g. "Inspected 52 URLs: 50 indexed, 2 not indexed"), not
     `SKIPPED`.
   - If a section says **SKIPPED** → that secret didn't load (check exact name/spelling).
   - If **GSC auth failed** → the service account
     `aswhub-index-checker@maxifi-aswhub-index.iam.gserviceaccount.com` is not yet
     added as a Full user in Search Console, or `GSC_SA_JSON` was truncated.
   - If **Bing errors / host_not_allowed** → `ssl.bing.com` missing from the allowlist.
   - The **Perplexity** and **Bing rank** sections are optional: SKIPPED means
     their key isn't set; that does not fail verification. When live they pre-fill
     `monitoring/latest-capture.csv` for the manual battery.

4. **Report:** post the script's Markdown output, flag any URL listed as *not
   indexed* (actionable: resubmit in GSC / check robots, canonical, noindex), and
   state clearly whether the monthly automation is fully live.

The citation-scrape table staying `BLOCKED` is expected and fine — the
index-status sections are the authoritative signal.
