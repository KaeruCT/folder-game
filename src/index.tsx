import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App";

// biome-ignore lint/style/noNonNullAssertion: standard React 18 pattern
createRoot(document.getElementById("root")!).render(<App />);
