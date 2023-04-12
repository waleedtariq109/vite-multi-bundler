import { join } from "path";
import { promises as fs } from "fs";
import { minify } from "terser";
import postcss from "postcss";
import cssnano from "cssnano";

/**
 * A Vite plugin to bundle multiple CSS and JavaScript files into a single file and minify it.
 *
 * @param {{
 *   css?: Array<{
 *     filename: string,
 *     outputDir: string,
 *     entryPoints: string[],
 *   }>,
 *   js?: Array<{
 *     filename: string,
 *     outputDir: string,
 *     entryPoints: string[],
 *   }>,
 * }} options - The options to configure the plugin.
 * @returns {import('vite').Plugin} A Vite plugin instance.
 */
export default function multiBundlePlugin(options) {
  const { js, css } = options;

  return {
    name: "multi-bundle-plugin",
    async generateBundle(outputOptions, bundle) {
      if (js && Array.isArray(js)) {
        for (const jsOptions of js) {
          if (!jsOptions.entryPoints || !jsOptions.entryPoints.length) {
            continue;
          }
          const jsBundle = await bundleAssets(
            jsOptions.entryPoints,
            jsOptions.filename,
            jsOptions.outputDir
          );
          this.emitFile({
            type: "asset",
            fileName: jsOptions.filename,
            source: jsBundle,
          });
        }
      }

      if (css && Array.isArray(css)) {
        for (const cssOptions of css) {
          if (!cssOptions.entryPoints || !cssOptions.entryPoints.length) {
            continue;
          }
          const cssBundle = await bundleAssets(
            cssOptions.entryPoints,
            cssOptions.filename,
            cssOptions.outputDir,
            true
          );
          this.emitFile({
            type: "asset",
            fileName: cssOptions.filename,
            source: cssBundle,
          });
        }
      }
    },
  };
}

/**
 * Bundles multiple files into a single file and minify it.
 *
 * @param {string[]} files - The array of file paths to bundle.
 * @param {string} filename - The output file name.
 * @param {string} outputDir - The output directory path.
 * @param {boolean} isCss - Whether the files to be bundled are CSS files or not.
 * @returns {Promise<string>} The bundled and minified code.
 */
async function bundleAssets(files, filename, outputDir, isCss = false) {
  const cwd = process.cwd();
  const fileContents = await Promise.all(
    files.map((filePath) => fs.readFile(join(cwd, filePath), "utf8"))
  );

  const bundledCode = fileContents.join(isCss ? "" : "\n");
  const minifiedCode = isCss
    ? await minifyCss(bundledCode)
    : (await minify(bundledCode)).code;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(join(outputDir, filename), minifiedCode);

  return minifiedCode;
}

/**
 * Minify the given CSS code using PostCSS and cssnano.
 *
 * @param {string} cssCode - The CSS code to minify.
 * @returns {Promise<string>} The minified CSS code.
 */
async function minifyCss(cssCode) {
  const result = await postcss([cssnano]).process(cssCode);
  return result.css;
}
