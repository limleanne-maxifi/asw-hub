const { execSync } = require("child_process");

module.exports = function (eleventyConfig) {
  // Populate data.lastmod on every page from its git last-commit date.
  // The sitemap template prefers this over item.date so the lastmod value
  // stays accurate as content is edited. Falls back to site.buildDate in the
  // sitemap if both are absent.
  eleventyConfig.addGlobalData("eleventyComputed", {
    lastmod: (data) => {
      if (data.lastmod) return data.lastmod; // respect explicit front-matter override
      if (!data.page || !data.page.inputPath) return null;
      try {
        const result = execSync(
          `git log -1 --format=%ci -- ${JSON.stringify(data.page.inputPath)}`,
          { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }
        ).trim();
        return result ? new Date(result).toISOString().split("T")[0] : null;
      } catch { return null; }
    }
  });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "public": "/" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    if (!dateObj) return "";
    return new Date(dateObj).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("dateToISO", (date) => date ? new Date(date).toISOString().split("T")[0] : "");

  eleventyConfig.addFilter("split", (value, sep) => {
    if (value === undefined || value === null) return [];
    return String(value).split(sep);
  });

  // Days from today to an ISO date string. Negative if the date is in the past.
  eleventyConfig.addFilter("daysUntil", (isoDate) => {
    if (!isoDate) return null;
    const target = new Date(isoDate);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((target - now) / msPerDay);
  });

  // Render a date as "1 July 2026" in en-GB.
  eleventyConfig.addFilter("longDate", (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });
  });

  // Build BreadcrumbList items from a permalink URL.
  // /sessions/opening-plenary-state-of-global-atm/ →
  //   [{ name: "Sessions", url: "/sessions/" },
  //    { name: "Opening plenary state of global atm", url: "/sessions/opening-plenary-state-of-global-atm/" }]
  eleventyConfig.addFilter("breadcrumbs", (pageUrl) => {
    if (!pageUrl || pageUrl === "/") return [];
    const parts = pageUrl.split("/").filter(Boolean);
    let acc = "";
    return parts.map((p) => {
      acc += "/" + p;
      const name = p.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
      return { name, url: acc + "/" };
    });
  });

  eleventyConfig.addCollection("themes", (api) =>
    api.getFilteredByGlob("src/themes/*.md").sort((a, b) =>
      (a.data.order || 0) - (b.data.order || 0)
    )
  );

  eleventyConfig.addCollection("sessions", (api) =>
    api.getFilteredByGlob("src/sessions/*.md").sort((a, b) =>
      (a.data.order || 0) - (b.data.order || 0)
    )
  );

  eleventyConfig.addCollection("speakers", (api) =>
    api.getFilteredByGlob("src/speakers/*.md").sort((a, b) =>
      a.data.title.localeCompare(b.data.title)
    )
  );

  eleventyConfig.addCollection("insights", function(collectionApi) {
    return collectionApi.getFilteredByTag("insights").sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  });

  eleventyConfig.addCollection("featuredSessions", (api) =>
    api
      .getFilteredByGlob("src/sessions/*.md")
      .filter((item) => item.data.featured)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
