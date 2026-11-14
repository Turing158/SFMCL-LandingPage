import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Theme } from "./App";

export default function LauncherPreview({ theme }: { theme: Theme }) {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [scale, setScale] = useState(1);
  const panel = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);
  const initialSource = useRef(`./embed/sfmcl-ui/index.html?theme=${theme}`);
  const openPreview = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    setClosing(false);
    setExpanded(true);
  }, []);
  const closePreview = useCallback(() => {
    if (closeTimer.current !== null) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setExpanded(false);
      setClosing(false);
    }, 180);
  }, []);
  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );
  const syncTheme = () =>
    frame.current?.contentWindow?.postMessage(
      { type: "sfmcl-preview-theme", theme },
      location.origin,
    );
  const syncMotion = useCallback(() => {
    const slide = panel.current?.closest<HTMLElement>(".deck-slide");
    frame.current?.contentWindow?.postMessage(
      {
        type: "sfmcl-preview-motion",
        paused: slide?.dataset.visible === "false" || slide?.dataset.motion === "running",
      },
      location.origin,
    );
  }, []);
  useEffect(syncTheme, [theme]);
  useEffect(() => {
    const slide = panel.current?.closest(".deck-slide");
    if (!slide) return;
    const observer = new MutationObserver(syncMotion);
    observer.observe(slide, { attributes: true, attributeFilter: ["data-visible", "data-motion"] });
    syncMotion();
    return () => observer.disconnect();
  }, [syncMotion]);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const resize = () => setScale(element.clientWidth / 1120);
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: "sfmcl-preview-expanded", expanded },
      location.origin,
    );
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    const saved: { element: HTMLElement; inert: boolean }[] = [];
    let element: HTMLElement | null = panel.current;
    while (element?.parentElement) {
      for (const sibling of element.parentElement.children) {
        if (sibling !== element && sibling instanceof HTMLElement) {
          saved.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      element = element.parentElement;
    }
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      saved.forEach(({ element, inert }) => {
        element.inert = inert;
      });
      const target = previousFocus?.isConnected
        ? previousFocus
        : frame.current;
      target?.focus({ preventScroll: true });
    };
  }, [expanded]);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow
      )
        return;
      const data = event.data;
      if (data?.type === "sfmcl-preview-ready") syncMotion();
      if (data?.type === "sfmcl-preview-close" && expanded) closePreview();
      if (data?.type === "sfmcl-preview-expand") {
        if (data.expanded === true) openPreview();
        else if (expanded) closePreview();
      }
      if (
        data?.type === "sfmcl-preview-wheel" &&
        !expanded &&
        Number.isFinite(data.deltaY)
      ) {
        const unit =
          data.deltaMode === 1 ? 16 : data.deltaMode === 2 ? innerHeight : 1;
        const delta = Math.max(-320, Math.min(320, data.deltaY * unit));
        const scrollEvent = new CustomEvent("sfmcl-site-wheel", {
          detail: { deltaY: delta }, cancelable: true,
        });
        if (!window.dispatchEvent(scrollEvent)) return;
        window.scrollBy({
          top: delta,
          behavior: "instant",
        });
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && expanded) closePreview();
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", escape);
    };
  }, [expanded, closePreview, openPreview, syncMotion]);
  return (
    <>
      <div className="launcher-preview-slot">
        <div
          ref={panel}
          className={`launcher-preview-panel ${expanded ? "is-expanded" : ""} ${closing ? "is-closing" : ""}`}
          role={expanded ? "dialog" : undefined}
          aria-modal={expanded ? true : undefined}
          aria-labelledby={expanded ? "launcher-preview-title" : undefined}
        >
          {expanded && (
            <button
              className="launcher-preview-backdrop"
              onClick={closePreview}
              aria-label="关闭放大预览"
              tabIndex={-1}
            />
          )}
          <div className="launcher-preview-window">
            {expanded && (
              <div className="launcher-preview-header">
                <span id="launcher-preview-title">
                  SFMCL-T · 可交互软件界面
                </span>
                <button
                  ref={closeButton}
                  className="icon-button"
                  onClick={closePreview}
                  aria-label="关闭软件界面预览"
                >
                  <X size={23} />
                </button>
              </div>
            )}
            <div className="launcher-preview">
              <div className="launcher-viewport" ref={viewport}>
                <iframe
                  ref={frame}
                  src={initialSource.current}
                  title="SFMCL-T 原版前端界面"
                  width="1120"
                  height="640"
                  style={{ transform: `scale(${scale})` }}
                  onLoad={() => { syncTheme(); syncMotion(); }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
