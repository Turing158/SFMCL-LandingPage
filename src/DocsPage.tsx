import { useLayoutEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useLocation, useParams } from "react-router-dom";
import { BookOpen, Box, ChevronRight, FolderOpen, Info } from "lucide-react";
import { docSections } from "./docs";

const calloutIcons: Record<string, typeof Info> = {
  versions: FolderOpen,
  resources: Box,
};

function useDocumentTransition(requestedIndex: number) {
  const [displayedIndex, setDisplayedIndex] = useState(requestedIndex);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("enter");
  const pane = useRef<HTMLElement>(null);
  const displayed = useRef(requestedIndex);
  const direction = useRef(1);
  const activeAnimation = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const element = pane.current;
    if (!element) return;
    if (requestedIndex === displayed.current && !activeAnimation.current) return;

    const style = getComputedStyle(element);
    const from = { opacity: style.opacity, transform: style.transform };
    activeAnimation.current?.cancel();

    // Restore the current document when a rapid selection returns to it.
    const restoring = requestedIndex === displayed.current;
    direction.current = requestedIndex >= displayed.current ? 1 : -1;
    setPhase(restoring ? "enter" : "exit");
    const animation = element.animate(
      [
        from,
        restoring
          ? { opacity: 1, transform: "none" }
          : {
              opacity: 0,
              transform: `translateX(${-direction.current * 20}px) translateY(-4px)`,
            },
      ],
      { duration: 180, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "both" },
    );
    activeAnimation.current = animation;
    let cancelled = false;
    void animation.finished.then(
      () => {
        if (cancelled) return;
        if (restoring) {
          setPhase("idle");
        } else {
          displayed.current = requestedIndex;
          setDisplayedIndex(requestedIndex);
        }
      },
      () => {},
    );
    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [requestedIndex]);

  useLayoutEffect(() => {
    const element = pane.current;
    if (!element) return;
    activeAnimation.current?.cancel();
    setPhase("enter");
    const animation = element.animate(
      [
        {
          opacity: 0,
          transform: `translateX(${direction.current * 24}px) translateY(8px)`,
        },
        { opacity: 1, transform: "none" },
      ],
      { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
    );
    activeAnimation.current = animation;
    void animation.finished.then(
      () => {
        if (activeAnimation.current === animation) setPhase("idle");
      },
      () => {},
    );
    return () => animation.cancel();
  }, [displayedIndex]);

  return { displayedIndex, phase, pane };
}

export default function DocsPage() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const { documentId } = useParams<{ documentId: string }>();
  const { hash } = useLocation();
  const requestedId = documentId ?? hash.slice(1);
  const requestedIndex = Math.max(
    0,
    docSections.findIndex(({ id }) => id === requestedId),
  );
  const { displayedIndex, phase, pane } = useDocumentTransition(requestedIndex);
  const currentDocument = docSections[displayedIndex];
  const CalloutIcon = calloutIcons[currentDocument.id] ?? Info;

  return (
    <main id="main-content" tabIndex={-1} className="inner-page docs-page">
      <div className="container docs-grid">
        <div className="docs-sidebar-slot">
          <aside className="docs-sidebar">
            <div className="docs-sidebar-scroll">
              <span className="eyebrow">
                <BookOpen size={14} /> 使用文档
              </span>
              <nav aria-label="文档目录">
                {docSections.map(({ id, title }, index) => (
                  <Link
                    key={id}
                    to={`/docs/${id}`}
                    aria-current={requestedIndex === index ? "page" : undefined}
                  >
                    <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                    {title}
                    <ChevronRight size={13} />
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </div>
        <article className="docs-article" aria-busy={phase !== "idle"}>
          <h1>从这里，走进你的世界。</h1>
          <p className="docs-lead">
            SFMCL-T 使用指南。选好角色与版本，准备好
            Java，剩下的就交给下一次冒险。
          </p>
          <div className="docs-document-stage" aria-live="polite" aria-atomic="true">
            <section
              ref={pane}
              id={currentDocument.id}
              className="docs-document"
              data-phase={phase}
              aria-labelledby="docs-current-title"
              inert={phase === "exit"}
            >
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h2 id="docs-current-title">{children}</h2>,
                  h2: ({ children }) => <h3>{children}</h3>,
                  h3: ({ children }) => <h4>{children}</h4>,
                  ol: ({ children }) => <ol className="doc-steps">{children}</ol>,
                  table: ({ children }) => (
                    <div className="doc-table-wrap"><table>{children}</table></div>
                  ),
                  blockquote: ({ children }) => (
                    <div className="doc-callout">
                      <CalloutIcon size={19} />
                      {children}
                    </div>
                  ),
                  a: ({ children, href }) =>
                    href?.startsWith("/") ? (
                      <Link to={href}>{children}</Link>
                    ) : (
                      <a href={href} target="_blank" rel="noreferrer">{children}</a>
                    ),
                }}
              >
                {currentDocument.content}
              </Markdown>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
