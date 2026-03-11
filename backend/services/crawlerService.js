const axios = require("axios");
const cheerio = require("cheerio");

async function crawlSite(url, limit = 5) {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const links = new Set();

    $("a").each((i, el) => {
      const href = $(el).attr("href");

      if (!href) return;

      if (href.startsWith("/")) {
        const fullUrl = new URL(href, url).href;
        links.add(fullUrl);
      }

      if (href.startsWith(url)) {
        links.add(href);
      }
    });

    return Array.from(links).slice(0, limit);
  } catch (error) {
    console.error("Crawler error:", error.message);
    return [];
  }
}

module.exports = { crawlSite };