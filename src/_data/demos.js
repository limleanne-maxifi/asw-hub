// Loads every per-prospect demo config from the top-level `demos/` directory.
// Each demos/{slug}.json becomes one generated page at /demo/{slug}/ via the
// pagination in src/demo.njk. Adding a prospect = adding one JSON file here;
// no template changes needed.
const fs = require("fs");
const path = require("path");

module.exports = () => {
  const dir = path.join(__dirname, "..", "..", "demos");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const config = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (!config.slug) config.slug = path.basename(f, ".json");
      if (config.slug === "probe") {
        // netlify.toml force-proxies /demo/probe to the Render engine backend;
        // a page at that slug would be unreachable in production.
        throw new Error("demos/probe.json: slug 'probe' is reserved for the engine proxy");
      }
      return config;
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
};
