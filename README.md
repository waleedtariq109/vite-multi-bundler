# vite-multi-bundler

A Vite plugin to bundle multiple CSS and JavaScript files into a single file and minify it.

[![https://nodei.co/npm/vite-multi-bundler.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/vite-multi-bundler.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/vite-multi-bundler)

## Installation

You can install the `vite-multi-bundler` using npm:

```sh
npm install vite-multi-bundler --save-dev
```

## Usage

First, import the plugin and add it to your Vite config file:

**NOTE:** If you want file versioning, you don't need to specify the `file_versioning` value inside the `viteMultiBundler()` function as its default value is already set to true.

### Usage with file versioning

This will generate the `manifest.json` inside the `/dist`

```js
import { defineConfig } from "vite";
import viteMultiBundler from "vite-multi-bundler";

export default defineConfig({
  // Note: While giving the file name, you don't need to add the file extension. The plugin handles this automatically on its own.

  plugins: [
    viteMultiBundler({
      file_versioning: true, // default => true
      js: [
        {
          filename: "backend", // after bundling, => backend-[file_version].js
          entryPoints: ["src/admin.js", "src/user.js"],
        },
        {
          filename: "bundled.min",
          entryPoints: ["test/roles.js"],
        },
      ],
      css: [
        {
          filename: "common", // after bundling, => common-[file_version].css
          entryPoints: ["src/user.css", "src/admin.css"],
        },
        {
          filename: "bundled.min", // after bundling, => bundled.min-[file_version].css
          entryPoints: ["test/elements.css"],
        },
      ],
    }),
  ],
});
```

### Usage without file versioning

```js
import { defineConfig } from "vite";
import viteMultiBundler from "vite-multi-bundler";

export default defineConfig({
  // Note: While giving the file name, you don't need to add the file extension. The plugin handles this automatically on its own.

  plugins: [
    viteMultiBundler({
      file_versioning: false, // default => true
      js: [
        {
          filename: "backend", // after bundling, => backend.js
          entryPoints: ["src/admin.js", "src/user.js"],
        },
        {
          filename: "bundled.min", // after bundling, => bundled.min.js
          entryPoints: ["test/roles.js"],
        },
      ],
      css: [
        {
          filename: "common", // after bundling, => common.css
          entryPoints: ["src/user.css", "src/admin.css"],
        },
        {
          filename: "bundled.min", // after bundling, => bundled.min.css
          entryPoints: ["test/elements.css"],
        },
      ],
    }),
  ],
});
```

You can define multiple entry points for each bundle and specify the output directory and filename. In the example above, we define two bundles, one for JavaScript and one for CSS.

Once you have defined your bundles, Vite will automatically generate the bundled files in the specified output directories when you run the `npm run build` command.

## Options

The `vite-multi-bundler` takes an options object with the following properties:

- `file_versioning` (Boolean): The default value is true

  - If this option is set to true, then the generated file will have a random version number, for example, `common-09sx89.js`, and it will also generate the `manifest.json` file.

  - If you want the file to be generated without a version number, then set this option to false. It will generate the file with the specified name, such as `common.js`, and it won't generate the `manifest.json` file

- `js` (Array): The options array for the JavaScript bundle

  - Object:
    - `filename` (string): The name of the output file
    - `entryPoints` (string[]): An array of entry points for the JavaScript bundle

- `css` (Array): The options array for the CSS bundle
  - Object
    - `filename` (string): The name of the output file
    - `entryPoints` (string[]): An array of entry points for the CSS bundle

## Final Words

Using the `vite-multi-bundler` plugin with Vite is a simple and efficient way to generate multiple bundles for your JavaScript and CSS files. With the options provided, you can easily configure the filename and entry points for each bundle, making it easy to customize your build process to fit your project's needs.

## Contribution

This project is open source, and you are welcome to contribute if you want.
