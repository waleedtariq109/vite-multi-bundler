import { Plugin } from "vite";

export interface MultiBundlePluginOptions {
  css?: Array<{
    filename: string;
    outputDir: string;
    entryPoints: string[];
  }>;
  js?: Array<{
    filename: string;
    outputDir: string;
    entryPoints: string[];
  }>;
}

declare function multiBundlePlugin(options: MultiBundlePluginOptions): Plugin;

export default multiBundlePlugin;
