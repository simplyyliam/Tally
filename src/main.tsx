import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { App } from "./app/app"
import { createRepositories } from "./app/repositories"
import { preloadExcelReader } from "./features/import"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App repositories={createRepositories()} />
  </StrictMode>,
)

const whenIdle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 2000))
whenIdle(() => preloadExcelReader())
