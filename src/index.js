import path from "path";
import fs from "fs";
import crypto from "crypto";
import { minify } from "terser";
import postcss from "postcss";
import cssnano from "cssnano";

export default function multiBundlePlugin(options) {
  const { js, css, file_versioning = true } = options;
  let isExecuted = false;
  let manifest = {};

  return {
    name: "multi-bundle-plugin",
    async generateBundle(outputOptions, bundle) {
      if (isExecuted) return;

      if (js && Array.isArray(js)) {
        for (const jsOptions of js) {
          const filename = file_versioning
            ? `${jsOptions.filename}-${getUnique()}.js`
            : `${jsOptions.filename}.js`;
          const jsBundle = await bundleAssets(
            jsOptions.entryPoints,
            filename,
            false
          );
          if (file_versioning) {
            const integrity = generateHash(jsBundle);
            manifest[jsOptions.entryPoints.at(-1)] = {
              file: filename,
              isEntry: true,
              integrity,
            };
          }

          this.emitFile({
            type: "asset",
            fileName: filename,
            source: jsBundle,
          });
          // Delete file from root directory
          const rootDirFilePath = path.join(process.cwd(), filename);
          if (fs.existsSync(rootDirFilePath)) {
            await fs.promises.unlink(rootDirFilePath);
          }
        }
      }

      if (css && Array.isArray(css)) {
        for (const cssOptions of css) {
          const filename = file_versioning
            ? `${cssOptions.filename}-${getUnique()}.css`
            : `${cssOptions.filename}.css`;
          const cssBundle = await bundleAssets(
            cssOptions.entryPoints,
            filename,
            true,
            outputOptions.dir
          );
          if (file_versioning) {
            const integrity = generateHash(cssBundle);
            manifest[cssOptions.entryPoints.at(-1)] = {
              file: filename,
              isEntry: true,
              integrity,
            };
          }

          this.emitFile({
            type: "asset",
            fileName: filename,
            source: cssBundle,
          });
          // Delete file from root directory
          const rootDirFilePath = path.join(process.cwd(), filename);
          if (fs.existsSync(rootDirFilePath)) {
            await fs.promises.unlink(rootDirFilePath);
          }
        }
      }

      isExecuted = true;

      if (file_versioning) {
        // Write manifest file to disk
        const manifestPath = path.join(outputOptions.dir, "manifest.json");
        await fs.promises.writeFile(
          manifestPath,
          JSON.stringify(manifest, null, 2)
        );
      }
    },
  };
}

async function bundleAssets(files, filename, isCss = false, outDir) {
  const cwd = process.cwd();
  const fileContents = await Promise.all(
    files.map((filePath) =>
      fs.promises.readFile(path.join(cwd, filePath), "utf8")
    )
  );

  let bundledCode = fileContents.join(isCss ? "" : "\n");

  if (isCss) {
    // Resolve image paths in CSS
    bundledCode = await resolveCssImages(bundledCode, cwd, outDir);
  }

  const minifiedCode = isCss
    ? await minifyCss(bundledCode)
    : (await minify(bundledCode)).code;

  const distFilePath = path.join(process.cwd(), "dist", filename);
  await fs.promises.writeFile(distFilePath, minifiedCode);
  return minifiedCode;
}

async function resolveCssImages(cssCode, cwd, outDir) {
  const regex = /url\(["']?(.*?)["']?\)/g;
  const matches = [...cssCode.matchAll(regex)];

  for (const match of matches) {
    const imagePath = match[1];

    // Ignore data URI and external image paths
    if (!imagePath.startsWith("data:") && !imagePath.startsWith("http")) {
      const imagePathAbs = path.join(cwd, "resources", "images", imagePath);
      if (fs.existsSync(imagePathAbs)) {
        const hash = generateHash(await fs.promises.readFile(imagePathAbs));
        const filename = `${hash}${path.extname(imagePath)}`;

        // Copy image file to output directory and replace path in CSS
        const distImagePath = path.join(outDir, "images", filename);
        await fs.promises.mkdir(path.dirname(distImagePath), {
          recursive: true,
        });
        await fs.promises.copyFile(imagePathAbs, distImagePath);
        cssCode = cssCode.replace(imagePath, `images/${filename}`);
      }
    }
  }

  return cssCode;
}

async function minifyCss(cssCode) {
  const result = await postcss([cssnano]).process(cssCode);
  return result.css;
}

function generateHash(data) {
  const timestamp = new Date().getMilliseconds().toString();
  return crypto
    .createHash("sha512")
    .update(data + timestamp)
    .digest("hex");
}

function getUnique() {
  return Math.random().toString(36).slice(2, 8);
}
