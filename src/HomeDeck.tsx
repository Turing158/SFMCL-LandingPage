import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { heroMotions } from "./heroMotion";
import { loaderMotions } from "./loaderMotion";
import { ctaMotions } from "./ctaMotion";
import "./home-deck.css";

export interface HomeSlide {
  id: string;
  title: string;
  content: ReactNode;
}

type Phase = "idle" | "exit" | "enter";
type Direction = 1 | -1;

// Stop at card containers so their backgrounds and contents share one path.
const pieces = [
  ".feature-card", ".resource-card", ".tech-card", ".loader-card", ".loader-rope", ".step", ".faq-list details",
  "h1", "h2", "h3", "h4", "p", "a", "button", "summary",
  ".hero-copy", ".launcher-preview-slot", ".avatar-stage", ".identity-card",
  ".world-folders > div", ".folder-path", ".download-illustration > div",
  ".palette-stack", ".scene", ".floating-file",
  ".package-center", ".package-orbit", ".import-ready", ".art-cross",
  ".import-steps li", ".format-tags > span", ".hero-platform",
  ".hero-meta > span", ".preview-live", ".preview-note", ".step-top",
  ".hero-cross", ".hero-haze", ".hero-particles > span",
  ".resource-source", ".resource-tag", ".art-index", ".footer-bottom > span",
  ".feature-footnote > span", ".resource-footer > span",
  ".cta-backdrop", ".cta-pixel-word", ".cta-art .landscape",
].join(",");

function motionPieces(slide: HTMLElement) {
  const targets: Element[] = [];
  const walk = (element: Element) => {
    if (element.matches(pieces) || element instanceof SVGElement ||
      (!element.children.length && element.textContent?.trim())) {
      const rect = element.getBoundingClientRect();
      if (element.matches(".loader-card")) {
        const viewport = element.closest(".loader-ribbon")!.getBoundingClientRect();
        if (rect.right <= viewport.left || rect.left >= viewport.right) return;
      }
      if (rect.width) targets.push(element);
      return;
    }
    Array.from(element.children).forEach(walk);
  };
  const content = slide.querySelector(".deck-content");
  if (content) Array.from(content.children).forEach(walk);
  slide.querySelectorAll("[data-deck-piece]").forEach((element) => element.removeAttribute("data-deck-piece"));
  targets.forEach((element) => element.setAttribute("data-deck-piece", ""));
  return targets;
}

// Each visual group follows its chapter's path, mirrored for backward navigation.
function pathFrames(element: Element, index: number, chapter: number, direction: Direction, entering: boolean): Keyframe[] {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const side = rect.left + rect.width / 2 < innerWidth / 2 ? -1 : 1;
  const spread = 1 + (index % 4) * 0.13;
  const x = Math.min(innerWidth * 0.72, 780) * side * spread;
  const y = Math.min(innerHeight * 0.65, 560) * direction;
  const turn = side * direction;
  // Join the paused ambient frame instead of snapping to an opaque, neutral
  // pose. Even invisible decorations reach full opacity along the path, then
  // animate back to their actual resting visibility before CSS takes over.
  const resting: Keyframe = {
    translate: style.translate === "none" ? "0px 0px" : style.translate,
    rotate: style.rotate === "none" ? "0deg" : style.rotate,
    scale: style.scale === "none" ? "1" : style.scale,
    opacity: style.opacity,
  };
  let route: Keyframe[];
  switch (chapter % 4) {
    case 0: // Sweeping arcs for decorative elements and later chapters.
      route = [resting,
        { translate: `${x * 0.09}px ${-y * 0.08}px`, rotate: `${turn * 3}deg`, opacity: 1 },
        { translate: `${x * 0.52}px ${-y * 0.38}px`, rotate: `${turn * 11}deg`, scale: "0.92", opacity: 0.65 },
        { translate: `${x}px ${-y}px`, rotate: `${turn * 19}deg`, scale: "0.8", opacity: 0 }];
      break;
    case 1: // Pixel stair: sideways, then up, then sideways again.
      route = [resting,
        { translate: `${x * 0.25}px 0px`, rotate: "0deg", opacity: 1 },
        { translate: `${x * 0.25}px ${-y * 0.6}px`, rotate: `${turn * 5}deg`, opacity: 0.7 },
        { translate: `${x}px ${-y * 0.6}px`, rotate: `${turn * 10}deg`, scale: "0.85", opacity: 0 }];
      break;
    case 2: // Orbital sweep around the chest and chapter centre.
      route = [resting,
        { translate: `${-x * 0.12}px ${y * 0.1}px`, rotate: `${-turn * 6}deg`, scale: "1.03", opacity: 1 },
        { translate: `${x * 0.3}px ${-y * 0.35}px`, rotate: `${turn * 18}deg`, scale: "0.8", opacity: 0.7 },
        { translate: `${x * 0.85}px ${-y}px`, rotate: `${turn * 36}deg`, scale: "0.55", opacity: 0 }];
      break;
    default: // Alternating diagonal ribbons.
      route = [resting,
        { translate: `${-x * 0.06}px ${y * 0.06}px`, rotate: `${-turn * 2}deg`, opacity: 1 },
        { translate: `${x * 0.4}px ${-y * 0.25}px`, rotate: `${turn * 8}deg`, opacity: 0.8 },
        { translate: `${x}px ${-y * (0.65 + index % 3 * 0.15)}px`, rotate: `${turn * 16}deg`, scale: "0.9", opacity: 0 }];
  }
  return entering ? route.reverse() : route;
}

export default function HomeDeck({ slides }: { slides: HomeSlide[] }) {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const initial = Math.max(0, slides.findIndex((slide) => `#${slide.id}` === hash));
  const [active, setActive] = useState(initial);
  const [phase, setPhase] = useState<Phase>("idle");
  const root = useRef<HTMLElement>(null);
  const chapters = useRef<HTMLElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const current = useRef(initial);
  const busy = useRef(false);
  const generation = useRef(0);
  const animations = useRef<Animation[]>([]);
  const request = useRef<(index: number) => void>(() => {});
  const wheel = useRef({ amount: 0, time: 0 });
  const focusAfter = useRef(false);

  const animate = useCallback(async (index: number, direction: Direction, entering: boolean) => {
    const panel = panels.current[index];
    if (!panel) return;
    const token = generation.current;
    // Finish old, finite CSS reveals so they cannot replay after the path animation.
    panel.getAnimations({ subtree: true }).forEach((animation) => {
      if (animation instanceof CSSAnimation && animation.effect?.getTiming().iterations !== Infinity) animation.finish();
    });
    const targets = motionPieces(panel);
    panel.dataset.motion = "running";
    // Read every resting position before creating effects; alternating reads and
    // animation writes forces repeated style/layout work, especially with iframe content.
    const motions = new Map([
      ...heroMotions(panel, entering),
      ...loaderMotions(panel, targets, entering),
      ...ctaMotions(panel, direction, entering),
    ]);
    const routes = targets.map((element, order) => motions.get(element)?.frames ??
      pathFrames(element, order, index, direction, entering));
    const travel = targets.map((element, order) => element.animate(
      routes[order],
      {
        duration: entering ? 650 : 430,
        delay: (entering ? order : targets.length - order - 1) % 8 * (entering ? 24 : 12),
        easing: entering ? "cubic-bezier(.16,1,.3,1)" : "cubic-bezier(.55,.05,.8,.45)",
        ...motions.get(element)?.options,
        fill: "both",
      },
    ));
    animations.current = travel;
    // Prepare the first frame and its layers before starting the motion. Large
    // iframe surfaces otherwise rasterize on the same frame as their first move.
    travel.forEach((animation) => animation.pause());
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    if (token !== generation.current) return;
    const startTime = document.timeline.currentTime;
    travel.forEach((animation) => {
      animation.play();
      animation.startTime = startTime;
    });
    await Promise.allSettled(travel.map((animation) => animation.finished));
  }, []);

  const change = useCallback(async (index: number) => {
    if (busy.current || index === current.current || index < 0 || index >= slides.length ||
      document.querySelector('.launcher-preview-panel.is-expanded, .mobile-navigation[data-open="true"]')) return;
    const token = generation.current;
    const from = current.current;
    const direction: Direction = index > from ? 1 : -1;
    busy.current = true;
    wheel.current.amount = 0;
    const previous = panels.current[from];
    focusAfter.current = !!previous?.contains(document.activeElement);
    if (focusAfter.current) root.current?.focus({ preventScroll: true });
    setPhase("exit");
    await animate(from, direction, false);
    if (token !== generation.current) return;
    // Hide the departed panel before clearing its final animation frame.
    if (previous) { previous.dataset.visible = "false"; previous.inert = true; }
    animations.current.forEach((animation) => animation.cancel());
    if (previous) delete previous.dataset.motion;
    current.current = index;
    const next = panels.current[index];
    if (next) {
      next.dataset.visible = "true";
      next.inert = true;
      const scroller = next.querySelector<HTMLElement>(".deck-scroll");
      if (scroller) scroller.scrollTop = 0;
    }
    setActive(index);
    navigate({ pathname: "/", hash: index === 0 ? "" : `#${slides[index].id}` }, { replace: true });
    setPhase("enter");
    await animate(index, direction, true);
    if (token !== generation.current) return;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    if (next) delete next.dataset.motion;
    if (next) next.inert = false;
    busy.current = false;
    setPhase("idle");
    if (focusAfter.current) next?.querySelector<HTMLElement>("h1, h2")?.focus({ preventScroll: true });
  }, [animate, navigate, slides.length]);
  request.current = (index) => { void change(index); };

  useLayoutEffect(() => {
    document.documentElement.classList.add("home-deck-open");
    panels.current.forEach((panel, index) => {
      if (!panel) return;
      panel.inert = index !== current.current;
      panel.querySelectorAll<HTMLElement>("h1, h2").forEach((heading) => { heading.tabIndex = -1; });
    });
    return () => {
      generation.current++;
      busy.current = false;
      animations.current.forEach((animation) => animation.cancel());
      document.documentElement.classList.remove("home-deck-open");
    };
  }, []);

  useEffect(() => {
    const index = hash ? slides.findIndex((slide) => `#${slide.id}` === hash) : 0;
    if (index >= 0) request.current(index);
  }, [hash]);

  useEffect(() => {
    const nav = chapters.current;
    if (!nav) return;
    const keepCurrentInView = (behavior: ScrollBehavior) => {
      if (!window.matchMedia("(max-width: 700px)").matches) {
        nav.scrollLeft = 0;
        return;
      }
      const button = nav.querySelectorAll<HTMLElement>(".deck-chapter")[active];
      if (button) nav.scrollTo({ left: button.offsetLeft - (nav.clientWidth - button.offsetWidth) / 2, behavior });
    };
    keepCurrentInView("smooth");
    const onResize = () => keepCurrentInView("instant");
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  useEffect(() => {
    const canScroll = (element: HTMLElement, delta: number) =>
      delta > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 3 : element.scrollTop > 3;
    const blocked = () => !!document.querySelector('.launcher-preview-panel.is-expanded, .mobile-navigation[data-open="true"]');
    const consumeWheel = (delta: number, targetElement: EventTarget | null, event: Event) => {
      if (blocked()) return;
      const now = performance.now();
      const gap = now - wheel.current.time;
      wheel.current.time = now;
      // Resume listening after the animation; continued scrolling can advance again.
      if (busy.current) { event.preventDefault(); return; }
      const panel = panels.current[current.current];
      let element = targetElement instanceof HTMLElement ? targetElement : null;
      while (element && element !== panel && root.current?.contains(element)) {
        const style = getComputedStyle(element);
        if (/(auto|scroll)/.test(style.overflowY) && canScroll(element, delta)) {
          wheel.current.amount = 0;
          return;
        }
        element = element.parentElement;
      }
      event.preventDefault();
      if (gap > 180 || Math.sign(delta) !== Math.sign(wheel.current.amount)) wheel.current.amount = 0;
      wheel.current.amount += delta;
      if (Math.abs(wheel.current.amount) >= 48) {
        request.current(current.current + (delta > 0 ? 1 : -1));
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
      consumeWheel(event.deltaY * unit, event.target, event);
    };
    const previewWheel = (event: Event) => {
      const custom = event as CustomEvent<{ deltaY: number }>;
      if (current.current !== 0) return;
      event.preventDefault();
      consumeWheel(custom.detail.deltaY, null, event);
    };
    const onKey = (event: KeyboardEvent) => {
      if (blocked() || event.altKey || event.ctrlKey || event.metaKey ||
        (event.target instanceof Element && event.target.closest('input, textarea, select, button, a, summary, [contenteditable="true"]'))) return;
      const direction = ["ArrowDown", "PageDown", " "].includes(event.key) ? (event.shiftKey ? -1 : 1) :
        ["ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault(); request.current(event.key === "Home" ? 0 : slides.length - 1); return;
      }
      if (!direction) return;
      event.preventDefault();
      if (busy.current) return;
      request.current(current.current + direction);
    };
    let touch: { x: number; y: number } | null = null;
    const onTouchStart = (event: TouchEvent) => {
      const point = event.touches[0];
      touch = event.touches.length === 1 && point && !blocked() && !busy.current ?
        { x: point.clientX, y: point.clientY } : null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const start = touch; touch = null;
      const point = event.changedTouches[0];
      if (!start || !point || blocked() || busy.current) return;
      const delta = start.y - point.clientY;
      if (Math.abs(delta) < 60 || Math.abs(delta) < Math.abs(start.x - point.clientX)) return;
      request.current(current.current + (delta > 0 ? 1 : -1));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("sfmcl-site-wheel", previewWheel);
    window.addEventListener("keydown", onKey);
    const stage = root.current;
    stage?.addEventListener("touchstart", onTouchStart, { passive: true });
    stage?.addEventListener("touchend", onTouchEnd, { passive: true });
    const cancelTouch = () => { touch = null; };
    stage?.addEventListener("touchcancel", cancelTouch);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("sfmcl-site-wheel", previewWheel);
      window.removeEventListener("keydown", onKey);
      stage?.removeEventListener("touchstart", onTouchStart);
      stage?.removeEventListener("touchend", onTouchEnd);
      stage?.removeEventListener("touchcancel", cancelTouch);
    };
  }, [slides.length]);

  return (
    <main className="home-deck" id="main-content" tabIndex={-1} ref={root} data-phase={phase} data-active={slides[active].id}>
      <div className="deck-stage">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`deck-slide deck-${slide.id}`} ref={(element) => { panels.current[index] = element; }}
            data-visible={index === active ? "true" : "false"} aria-hidden={index !== active}
            role="region" aria-label={`${index + 1} / ${slides.length} · ${slide.title}`}>
            <div className="deck-scroll"><div className="deck-content">{slide.content}</div></div>
          </div>
        ))}
      </div>
      <nav className="deck-chapters" aria-label="首页章节" ref={chapters}>
        {slides.map((slide, index) => (
          <button key={slide.id} className="deck-chapter" aria-label={`第 ${index + 1} 屏：${slide.title}`}
            aria-current={active === index ? "step" : undefined} aria-disabled={phase !== "idle"}
            onClick={() => request.current(index)}>
            <span className="deck-chapter-name">{slide.title}</span><span className="deck-dot" />
          </button>
        ))}
      </nav>
      <span className="sr-only" role="status" aria-live="polite">{phase === "idle" ? `第 ${active + 1} 屏，共 ${slides.length} 屏：${slides[active].title}` : ""}</span>
    </main>
  );
}
