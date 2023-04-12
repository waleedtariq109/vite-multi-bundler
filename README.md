# vite-multi-bundler

A Vite plugin to bundle multiple CSS and JavaScript files into a single file and minify it.

## Installation

You can install the `vite-multi-bundler` using npm:

```sh
npm install vite-multi-bundler --save-dev
```

## Usage

First, import the plugin and add it to your Vite config file:

```js
import { defineConfig } from "vite";
import viteMultiBundler from "vite-multi-bundler";

export default defineConfig({
  plugins: [
    viteMultiBundler({
      js: {
        filename: "bundled.min.js",
        outputDir: "./output/js",
        entryPoints: ["src/index.js", "src/another.js"],
      },
      css: {
        filename: "bundled.min.css",
        outputDir: "./output/css",
        entryPoints: ["src/styles.css"],
      },
    }),
  ],
});
```

You can define multiple entry points for each bundle and specify the output directory and filename. In the example above, we define two bundles, one for JavaScript and one for CSS.

Once you have defined your bundles, Vite will automatically generate the bundled files in the specified output directories when you run the `npm run build` command.

## Options

The `vite-multi-bundler` takes an options object with the following properties:

- `js` (object): The options for the JavaScript bundle
  - `filename` (string): The name of the output file
  - `outputDir` (string): The directory where the output file should be saved
  - `entryPoints` (string[]): An array of entry points for the JavaScript bundle
- `css` (object): The options for the CSS bundle
  - `filename` (string): The name of the output file
  - `outputDir` (string): The directory where the output file should be saved
  - `entryPoints` (string[]): An array of entry points for the CSS bundle

## Final Words

Using the `vite-multi-bundler` plugin with Vite is a simple and efficient way to generate a single bundle for your multiple JavaScript and CSS files. With the options provided, you can easily configure the output directory, filename, and entry points for each bundle, making it easy to customize your build process to fit your project's needs.
