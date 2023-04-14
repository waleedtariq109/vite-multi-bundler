import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.js"),
      },
      output: {
        dir: ".output",
        format: "es",
        name: "index.min",
      },
    },
  },
});
