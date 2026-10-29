import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

// `vite build --mode offline` produces one self-contained tally.html that can be
// downloaded and opened straight from disk (file://), with no server or internet.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    ...(mode === "offline" ? [viteSingleFile()] : []),
  ],
  build: mode === "offline" ? { outDir: "dist-offline" } : undefined,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}))
