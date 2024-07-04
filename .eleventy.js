const CleanCSS = require('clean-css');
const UglifyJS = require('uglify-js');
const autoprefixer = require('autoprefixer');
const postCSS = require('postcss');
const postCSSDC = require('postcss-discard-comments');
const markdownIt = require("markdown-it");
const markdownItAttrs = require('markdown-it-attrs');
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // 11ty plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Minify CSS
  eleventyConfig.addFilter('cssmin', function (code) {
    css = new CleanCSS({}).minify(code).styles;
    return postCSS([ autoprefixer, postCSSDC({removeAll: true}) ]).process(css).css;
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
  eleventyConfig.addShortcode("image", async function(src, alt, cls, pictureCls = "", sizes = "(min-width: 30em) 50vw, 100vw", widths = [300, 600, 1000, 1980]) {
		if(alt === undefined) {
			// You bet we throw an error on missing alt (alt="" works okay)
			throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
		}

		let metadata = await Image(src, {
			widths: widths,
			formats: ['webp', 'jpeg'],
      urlPath: "/static/img/",
      outputDir: "./static/img/"
		});

		let lowsrc = metadata.jpeg[0];
		let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

		return `<picture class="${pictureCls}">
			${Object.values(metadata).map(imageFormat => {
				return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
			}).join("\n")}
				<img
					src="${lowsrc.url}"
					width="${highsrc.width}"
					height="${highsrc.height}"
          class="${cls}"
					alt="${alt}"
					loading="lazy"
					decoding="async">
			</picture>`;
	});

  eleventyConfig.addPairedShortcode("figure", function(content, classes = '') {
    return `<figure class="figure ${classes}">` + content +'</figure>'});

  eleventyConfig.addPairedShortcode("caption", function(caption, classes = '') {
    return `<figcaption class="figcaption ${classes}">` + caption + '</figcaption>'});


  eleventyConfig.addPassthroughCopy('static/');
  eleventyConfig.addWatchTarget('./src/sass/');
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('CNAME');

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAttrs);
  eleventyConfig.setLibrary("md", markdownLibrary);

  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  return {
    templateFormats: ['md', 'njk', 'html', 'liquid'],

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
      input: 'pages',
      includes: '../src/_includes',
      layouts: '../src/_includes/layouts',
      data: '../src/_data',
      output: '_site',
    },
  };
}