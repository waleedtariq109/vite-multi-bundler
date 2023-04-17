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
            manifest[jsOptions.entryPoints] = {
              file: filename,
              isEntry: true,
              src:
                jsOptions.entryPoints.length > 1
                  ? jsOptions.entryPoints
                  : jsOptions.entryPoints[0],
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
            true
          );
          if (file_versioning) {
            const integrity = generateHash(cssBundle);
            manifest[cssOptions.entryPoints] = {
              file: filename,
              isEntry: true,
              src:
                cssOptions.entryPoints.length > 1
                  ? cssOptions.entryPoints
                  : cssOptions.entryPoints[0],
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

async function bundleAssets(files, filename, isCss = false) {
  const cwd = process.cwd();
  const fileContents = await Promise.all(
    files.map((filePath) =>
      fs.promises.readFile(path.join(cwd, filePath), "utf8")
    )
  );

  let bundledCode = fileContents.join(isCss ? "" : "\n");

  if (isCss) {
    // Resolve image paths in CSS
    bundledCode = await resolveCssImages(bundledCode, cwd);
  }

  const minifiedCode = isCss
    ? await minifyCss(bundledCode)
    : (await minify(bundledCode)).code;

  const distFilePath = path.join(process.cwd(), "dist", filename);
  await fs.promises.writeFile(distFilePath, minifiedCode);
  return minifiedCode;
}

async function resolveCssImages(cssCode, cwd) {
  const regex = /url\(["']?(.*?)["']?\)/g;
  const matches = [...cssCode.matchAll(regex)];

  for (const match of matches) {
    const imagePath = match[1];

    // Ignore data URI and external image paths
    if (!imagePath.startsWith("data:") && !imagePath.startsWith("http")) {
      const imagePathAbs = path.join(cwd, "resources", "images", imagePath);
      console.log(imagePathAbs);
      if (fs.existsSync(imagePathAbs)) {
        const hash = generateHash(await fs.promises.readFile(imagePathAbs));
        const filename = `${hash}${path.extname(imagePath)}`;

        // Copy image file to dist/images folder and replace path in CSS
        const distImagePath = path.join(
          process.cwd(),
          "dist",
          "images",
          filename
        );
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
  return crypto.createHash("sha256").update(data).digest("hex");
}

function getUnique() {
  return Math.random().toString(36).slice(2, 8);
}
