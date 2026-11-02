import { readFileSync } from "fs"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { defineConfig, type Plugin } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

/** The downloaded file must stand alone, so the favicon goes inside it too. */
function inlineFavicon(): Plugin {
  return {
    name: "tally-inline-favicon",
    transformIndexHtml(html) {
      const svg = readFileSync(path.resolve(import.meta.dirname, "public/favicon.svg"), "utf8")
      return html.replace(/href="[^"]*favicon\.svg"/, `href="data:image/svg+xml,${encodeURIComponent(svg)}"`)
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
    ...(mode === "offline" ? [viteSingleFile(), inlineFavicon()] : []),
  ],
  build: mode === "offline" ? { outDir: "dist-offline" } : undefined,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}))
