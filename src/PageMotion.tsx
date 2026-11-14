import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const revealSelector = [
  ".section-heading",
  ".feature-card",
  ".feature-footnote",
  ".loader-ribbon",
  ".modpack-note",
  ".resource-description",
  ".resource-card",
  ".resource-footer",
  ".step",
  ".faq-grid > div:first-child",
  ".faq-list details",
  ".cta-inner > div",
  ".page-heading",
  ".architecture-control",
  ".release-feedback",
  ".download-option",
  ".download-notes",
  ".download-source",
  ".docs-sidebar",
  ".docs-article > h1",
  ".docs-lead",
  ".release-entry",
  ".footer-top",
  ".footer-bottom",
].join(",");

export default function PageMotion() {
  const { pathname } = useLocation();
  const motionPage = pathname === "/docs" || pathname.startsWith("/docs/") ? "/docs" : pathname;
  const progress = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    if (main.classList.contains("home-deck")) return;
    const observed = new Set<HTMLElement>();
    const reveal = (element: HTMLElement) => {
      if (element.dataset.reveal === "pending")
        element.dataset.reveal = "shown";
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          element.dataset.inView = String(entry.isIntersecting);
          if (entry.isIntersecting) reveal(element);
        }
      },
      { rootMargin: "0px", threshold: 0 },
    );
    const observe = (element: HTMLElement) => {
      if (observed.has(element)) return;
      observed.add(element);
      if (element.matches(revealSelector)) {
        const siblings = Array.from(
          element.parentElement?.children ?? [],
        ).filter((sibling) => sibling.matches(revealSelector));
        element.style.setProperty(
          "--reveal-delay",
          `${Math.max(0, siblings.indexOf(element) % 4) * 80}ms`,
        );
        if (!element.dataset.reveal) element.dataset.reveal = "pending";
      }
      observer.observe(element);
    };
    const observeTree = (root: Element) => {
      if (root instanceof HTMLElement && root.matches(revealSelector))
        observe(root);
      root.querySelectorAll<HTMLElement>(revealSelector).forEach(observe);
    };
    observeTree(main);
    document
      .querySelector(".site-footer")
      ?.querySelectorAll<HTMLElement>(revealSelector)
      .forEach(observe);
    main.querySelectorAll<HTMLElement>(".hero, .cta-section").forEach(observe);

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - innerHeight;
      const fraction =
        distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
      progress.current?.style.setProperty(
        "--scroll-progress",
        String(fraction),
      );
    };
    const scheduleProgress = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (!(node instanceof Element)) continue;
          for (const element of observed) {
            if (node === element || node.contains(element)) {
              observer.unobserve(element);
              observed.delete(element);
            }
          }
        }
        for (const node of record.addedNodes)
          if (node instanceof Element) observeTree(node);
      }
      scheduleProgress();
    });
    mutations.observe(main, { childList: true, subtree: true });
    const resize = new ResizeObserver(scheduleProgress);
    resize.observe(main);
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>(
        "[data-reveal='pending']",
      );
      if (element) reveal(element);
    };
    document.addEventListener("focusin", focus);
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);
    scheduleProgress();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      resize.disconnect();
      document.removeEventListener("focusin", focus);
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      for (const element of observed) {
        delete element.dataset.reveal;
        delete element.dataset.inView;
        element.style.removeProperty("--reveal-delay");
      }
    };
  }, [motionPage]);

  return pathname === "/" ? null : <div className="scroll-progress" ref={progress} aria-hidden="true" />;
}
