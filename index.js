import { join } from "path";
import { promises as fs } from "fs";
import { minify } from "terser";

/**
 * A Vite plugin to bundle multiple CSS and JavaScript files into a single file and minify it.
 *
 * @param {{
 *   css?: {
 *     filename: string,
 *     outputDir: string,
 *     entryPoints: string[],
 *   },
 *   js?: {
 *     filename: string,
 *     outputDir: string,
 *     entryPoints: string[],
 *   },
 * }} options - The options to configure the plugin.
 * @returns {import('vite').Plugin} A Vite plugin instance.
 */
export default function multiBundlePlugin(options) {
  const { js, css } = options;

  return {
    name: "multi-bundle-plugin",
    async generateBundle(outputOptions, bundle) {
      const jsBundle =
        js && js.entryPoints.length
          ? await bundleAssets(js.entryPoints, js.filename, js.outputDir)
          : null;
      const cssBundle =
        css && css.entryPoints.length
          ? await bundleAssets(css.entryPoints, css.filename, css.outputDir)
          : null;

      if (jsBundle) {
        this.emitFile({
          type: "asset",
          fileName: js.filename,
          source: jsBundle,
        });
      }

      if (cssBundle) {
        this.emitFile({
          type: "asset",
          fileName: css.filename,
          source: cssBundle,
        });
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
 * @returns {Promise<string>} The bundled and minified code.
 */
async function bundleAssets(files, filename, outputDir) {
  const cwd = process.cwd();
  const fileContents = await Promise.all(
    files.map((filePath) => fs.readFile(join(cwd, filePath), "utf8"))
  );

  const bundledCode = fileContents.join("\n");
  const minifiedCode = (await minify(bundledCode)).code;

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(join(outputDir, filename), minifiedCode);

  return minifiedCode;
}
