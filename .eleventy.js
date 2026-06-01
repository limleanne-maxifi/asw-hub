module.exports = function (eleventyConfig) {
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
