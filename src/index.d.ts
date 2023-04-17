import { Plugin } from "vite";

export interface MultiBundlePluginOptions {
  file_versioning?: boolean;
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
