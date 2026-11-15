// This side effect runs before App/api evaluate desktop detection.
import "./bridge";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import App from "./src/App";
import { Provider, useApp } from "./src/store";
import { ConfirmationDialogHost } from "./src/ConfirmationDialog";
import { TooltipHost } from "./src/Tooltip";
import { initializeScrollbars } from "./src/scrollbars";
import { setPreviewTheme, setPreviewExpanded } from "./bridge";
import { initializePreviewInteractions } from "./interactions";
import "./src/styles.css";
import "./src/pixel-geometry.css";
import "./src/controls.css";
import "./src/surfaces.css";
import "./src/sidebar.css";
import "./src/resources.css";
import "./src/players.css";
import "./src/tooltip.css";
import "./src/window-motion.css";
import "./src/scrollbars.css";
import "./preview.css";

function PreviewApp() {
  const app = useApp();
  const current = useRef(app);
  current.current = app;
  useEffect(() => {
    if (!app.initialized) return;
    return initializePreviewInteractions((message) => current.current.notify(message));
  }, [app.initialized]);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== parent || event.origin !== location.origin) return;
      if (event.data?.type === "sfmcl-preview-theme") {
        setPreviewTheme(event.data.theme);
        void current.current.refresh();
      }
      if (event.data?.type === "sfmcl-preview-expanded")
        setPreviewExpanded(event.data.expanded === true);
      if (event.data?.type === "sfmcl-preview-motion")
        document.documentElement.dataset.previewPaused = String(event.data.paused === true);
    };
    const onSuccess = (event: Event) => current.current.notify((event as CustomEvent<string>).detail);
    window.addEventListener("message", onMessage);
    window.addEventListener("sfmcl-preview-success", onSuccess);
    parent.postMessage({ type: "sfmcl-preview-ready" }, location.origin);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("sfmcl-preview-success", onSuccess);
    };
  }, []);
  if (!app.initialized) return null;
  return (
    <>
      <div className="preview-app-surface">
        <App />
      </div>
      <ConfirmationDialogHost />
      <TooltipHost />
    </>
  );
}
const disposeScrollbars = initializeScrollbars();
if (import.meta.hot) import.meta.hot.dispose(disposeScrollbars);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider><PreviewApp /></Provider>
  </React.StrictMode>,
);
