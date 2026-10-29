import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { App } from "./app/app"
import { createRepositories } from "./app/repositories"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App repositories={createRepositories()} />
  </StrictMode>,
)
