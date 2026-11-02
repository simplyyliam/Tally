import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { App } from "./app/app"
import { requestPersistentStorage } from "./app/persist-storage"
import { createRepositories } from "./app/repositories"
import { preloadExcelReader } from "./features/import"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App repositories={createRepositories()} />
  </StrictMode>,
)

requestPersistentStorage()

const whenIdle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 2000))
whenIdle(() => preloadExcelReader())
