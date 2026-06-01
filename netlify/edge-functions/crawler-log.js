/**
 * crawler-log — Netlify Edge Function
 *
 * Inspects the User-Agent of every incoming request. When it matches a known
 * AI crawler, emits one structured JSON line to the function log (visible in
 * Netlify's "Functions" tab, or forwarded to a log drain you configure in the
 * Netlify dashboard under Integrations → Log drains).
 *
 * The request is always passed through unchanged — zero latency overhead for
 * normal visitors. No cookies, no PII collected.
 *
 * To disable logging for a path (e.g. /css/, /images/), add it to SKIP_PREFIXES.
 *
 * SETUP (one-time, in Netlify UI):
 *   1. This file is auto-detected because it lives in netlify/edge-functions/.
 *   2. The [[edge_functions]] rule in netlify.toml maps it to "/*".
 *   3. Optional: add a Log Drain (Netlify dashboard → Integrations → Log drains)
 *      to forward logs to Datadog, S3, a webhook, etc.
 */

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Googlebot",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "meta-externalagent",
  "DuckAssistBot",
  "anthropic-ai",
  "Claude-Web",
];

const SKIP_PREFIXES = ["/css/", "/assets/", "/images/", "/.netlify/"];

export default async function crawlerLog(request, context) {
  const url = new URL(request.url);

  // Skip static assets — they're not meaningful citation signals
  for (const prefix of SKIP_PREFIXES) {
    if (url.pathname.startsWith(prefix)) {
      return context.next();
    }
  }

  const ua = request.headers.get("user-agent") || "";
  const matched = AI_CRAWLERS.find((bot) =>
    ua.toLowerCase().includes(bot.toLowerCase())
  );

  if (matched) {
    console.log(
      JSON.stringify({
        event: "ai_crawler_visit",
        bot: matched,
        ua,
        path: url.pathname,
        ts: new Date().toISOString(),
        country: context.geo?.country?.code ?? "unknown",
      })
    );
  }

  return context.next();
}

export const config = { path: "/*" };
