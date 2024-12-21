import pluginRss from "@11ty/eleventy-plugin-rss";
import CleanCSS from "clean-css";
import postCSS from "postcss";
import autoprefixer from "autoprefixer";
import UglifyJS from "uglify-js";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import timeToRead  from "eleventy-plugin-time-to-read";
import Image from "@11ty/eleventy-img";
import { DateTime } from "luxon";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import markdownIt11tyImage from "markdown-it-eleventy-img";
import { eleventyImageOnRequestDuringServePlugin } from "@11ty/eleventy-img";
import { inspect } from "util";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
  // 11ty plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(timeToRead, {
    speed: '850 characters per minute',
    style: "short"
  });

  // Extra filters
  eleventyConfig.addFilter("debug", (content) => `<pre>${inspect(content)}</pre>`);

  // Minify CSS
  eleventyConfig.addFilter('cssmin', function (code) {
    var css = new CleanCSS({}).minify(code).styles;
    return postCSS([ autoprefixer ]).process(css).css;
  });

  // Minify JS
  eleventyConfig.addFilter('jsmin', function (code) {
    let minified = UglifyJS.minify(code);
    if (minified.error) {
      console.log('UglifyJS error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  // Find an excerpt
  // eleventyConfig.setFrontMatterParsingOptions({
  //   excerpt: true,
  //   // Optional, default is "---"
  //   excerpt_separator: "<!-- excerpt -->",
  // });

  // Readable Date filter
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

  // Return active path attributes
  eleventyConfig.addShortcode('activepath', function (itemUrl, currentUrl, currentClass = "current", prefix = '') {
    if (itemUrl == '/' && itemUrl !== currentUrl) {
      return '';
    }
    if (currentUrl && currentUrl.startsWith(itemUrl)) {
      return prefix + currentClass;
    }
    return '';
  });

  // Return responsive images
  eleventyConfig.addShortcode("image", async function (src, alt, cls, widths = [300, 600], sizes = "100vh", picCls = "") {
		let metadata = await Image(src, {
			widths,
			formats: ["webp", "jpeg"],
      urlPath: "/public/img/",
      outputDir: "./content/public/img/"
		});

		let imageAttributes = {
      class: cls,
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};

    let options = {
      pictureAttributes: {
        class: picCls
      }
    }

		// You bet we throw an error on a missing alt (alt="" works okay)
		return Image.generateHTML(metadata, imageAttributes, options);
	});

  // Add the dev server middleware manually
  eleventyConfig.addPlugin(eleventyImageOnRequestDuringServePlugin);

  // Figure markup, as a paired shortcode
  eleventyConfig.addPairedShortcode("figure", function(content, caption, classes) {
    if (caption) {
      caption = '<figcaption>' + caption + '</figcaption>';
    }
    return '<figure class="' + classes +'">' + content + caption +'</figure>'});

  // Sort portfolio pieces by date
  eleventyConfig.addCollection('portfolio', (collection) => {
    var nav = collection.getFilteredByTag('portfolio');
    return sortByDate(nav).reverse();
  });

  // Sort portfolio pieces by order
  eleventyConfig.addCollection('portfolioByOrder', (collection) => {
    var nav = collection.getFilteredByTag('portfolio');
    return sortByOrder(nav);
  });

  // Sort portfolio pieces by date
  eleventyConfig.addCollection('blog', (collection) => {
    var nav = collection.getFilteredByGlob('content/blog/*.md');
    return sortByDate(nav).reverse();
  });

  // Get the full year number from a date
  eleventyConfig.addFilter("getFullYear", function(date) {
    return date.getFullYear();
  });

  // Get the zero-padded month number from a date
  eleventyConfig.addFilter("getMonth", function(date) {
    let month;
    month = '0' + (date.getMonth());
    return month.slice(-2);
  });

  eleventyConfig.addFilter("getMonthName", function(date) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return months[date.getMonth()];
  });

  // Get the zero-padded month number from a date
  eleventyConfig.addFilter("getDate", function(date) {
    return date.getDate();
  });

  function sortByOrder(collection) {
    return collection.sort((a, b) => {
      if (a.data.order < b.data.order) return -1;
      else if (a.data.order > b.data.order) return 1;
      else return 0;
    });
  }

  function sortByDate(collection) {
    return collection.sort((a, b) => {
      if (a.data.date < b.data.date) return -1;
      else if (a.data.date > b.data.date) return 1;
      else return 0;
    });
  }

  eleventyConfig.addPassthroughCopy('static/');
  eleventyConfig.addWatchTarget('./src/sass/');
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('CNAME');

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link do-not-display",
      symbol: "#",
      level: [1,2,3,4],
    }),
    slugify: eleventyConfig.getFilter("slug")
  }).use(markdownItAttrs).use(markdownIt11tyImage);
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  eleventyConfig.addPassthroughCopy('content/public/');
  eleventyConfig.addWatchTarget('./src/_sass/');
};

export const config = {
    templateFormats: [
      'md',
      'njk',
      'html',
      'liquid'
    ],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: '/',

    markdownTemplateEngine: 'liquid',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    passthroughFileCopy: true,
    dir: {
      input: 'content',
      includes: '../src/_includes',
      layouts: '../src/_includes/layouts',
      data: '../src/_data',
      output: '_site',
    }
};