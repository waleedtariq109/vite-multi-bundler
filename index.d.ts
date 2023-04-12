import type { Plugin } from "vite";

interface MultiBundlePluginOptions {
  css?: {
    filename: string;
    outputDir: string;
    entryPoints: string[];
  };
  js?: {
    filename: string;
    outputDir: string;
    entryPoints: string[];
  };
}

interface MultiBundlePlugin extends Plugin {
  name: string;
}

declare function multiBundlePlugin(
  options: MultiBundlePluginOptions
): MultiBundlePlugin;

export default multiBundlePlugin;
