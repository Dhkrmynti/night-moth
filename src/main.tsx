import { createRoot } from "react-dom/client";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource/fragment-mono/latin-400.css";
import "./styles/night.css";
import "./styles/memex.css";
import { App } from "./App";
import { Memex } from "./components/Memex";

const isMemex = window.location.pathname.replace(/\/$/, "") === "/lotnok";

createRoot(document.getElementById("root")!).render(isMemex ? <Memex /> : <App />);
