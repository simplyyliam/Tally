import { readFileSync } from "fs"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { defineConfig, type Plugin } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

/**
 * The downloaded file must stand alone: the favicon goes inside it, and the
 * install tags (manifest, home-screen icon) are dropped because a file opened
 * from disk can't be installed as an app anyway.
 */
function standaloneHtml(): Plugin {
  return {
    name: "tally-standalone-html",
    transformIndexHtml(html) {
      const svg = readFileSync(path.resolve(import.meta.dirname, "public/favicon.svg"), "utf8")
      return html
        .replace(/href="[^"]*favicon\.svg"/, `href="data:image/svg+xml,${encodeURIComponent(svg)}"`)
        .replace(/\s*<link rel="(manifest|apple-touch-icon)"[^>]*>/g, "")
    },
  }
}

// `vite build --mode offline` produces one self-contained tally.html that can be
// downloaded and opened straight from disk (file://), with no server or internet.
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    ...(mode === "offline" ? [viteSingleFile(), standaloneHtml()] : []),
  ],
  build: mode === "offline" ? { outDir: "dist-offline" } : undefined,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}))
