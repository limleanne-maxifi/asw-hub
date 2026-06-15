# Monitoring — daily indexing & citation tracker

The ASW Hub runs a daily automated monitor (a Claude Code on the web
[routine](https://code.claude.com/docs/en/routines)) that checks sitemap
health, spot-checks key pages, and tracks whether the hub is being cited
across five AI answer engines.

## Required network egress domains

The monitor runs in an Anthropic-managed cloud sandbox whose outbound
connections are governed by the environment's **Network access** setting.
The default **Trusted** level allows package registries and GitHub only — it
does **not** allow the hub's own domain or the search engines, so every check
fails with `HTTP 403 x-deny-reason: host_not_allowed` until the allowlist is
extended.

Set **Network access** to **Custom** on the environment (keep
"Also include default list of common package managers" ticked) and add:

```text
aswhub.maxifidigital.com
www.perplexity.ai
www.google.com
www.bing.com
chatgpt.com
claude.ai
```

- `aswhub.maxifidigital.com` is **required** for the sitemap and page-health
  checks. Without it the monitor cannot run at all.
- The five search-engine hosts power the citation-tracker table. Each may
  return `403`/`BLOCKED` independently if it rejects automated fetches —
  that is a per-engine result, not a config failure.

## Where to set it

There is no separate Environments page. Open the environment for editing via
the **cloud icon** wherever you start a session or configure the routine
(claude.ai/code), then use the **Network access** selector in the dialog.
See: https://code.claude.com/docs/en/claude-code-on-the-web#network-access

## Important: changes apply to the next session only

The egress policy is fixed when a container starts. Editing the allowlist does
**not** unblock a session that is already running — a fresh session (or the
next scheduled routine run) picks up the new policy. If you change the
allowlist and still see `host_not_allowed`, start a new session to confirm.

## Manual checks (run from a browser, not the sandbox)

- Google Search Console: https://search.google.com/search-console/index?resource_id=https%3A%2F%2Faswhub.maxifidigital.com%2F
- Bing Webmaster Tools: https://www.bing.com/webmasters/home
- Google index check: https://www.google.com/search?q=site%3Aaswhub.maxifidigital.com
