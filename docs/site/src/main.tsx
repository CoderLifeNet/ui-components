import { createRoot, hydrateRoot } from "react-dom/client";
import "./site.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import Site from "./Site";

const root = document.getElementById("root")!;
const path = window.location.pathname;
if (root.hasChildNodes()) hydrateRoot(root, <Site path={path} />);
else createRoot(root).render(<Site path={path} />);
