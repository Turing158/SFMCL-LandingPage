import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Github,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import Home from "./Home";
import { Changelog, Download } from "./Pages";
import DocsPage from "./DocsPage";
import { docSections } from "./docs";
import { REPO } from "./data";
import { useReleases } from "./useReleases";
import PageMotion from "./PageMotion";

export type Theme = "light" | "dark";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (pathname === "/" || pathname === "/docs" || pathname.startsWith("/docs/")) return;
    const frame = requestAnimationFrame(() => {
      if (hash)
        document.getElementById(hash.slice(1))?.scrollIntoView({
          behavior: "smooth",
        });
      else window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}

function Brand() {
  return (
    <>
      <img src="./assets/logo.png" alt="" width="30" height="30" />
      <span className="brand-word">
        SFMCL<span className="brand-t">-T</span>
      </span>
    </>
  );
}

function Header({
  theme,
  toggleTheme,
}: {
  theme: Theme;
  toggleTheme: () => void;
}) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 639px)");
    const closeOnWideScreen = () => {
      if (!narrow.matches) setOpen(false);
    };
    narrow.addEventListener("change", closeOnWideScreen);
    return () => narrow.removeEventListener("change", closeOnWideScreen);
  }, []);
  return (
    <header className="site-header">
      <nav className="nav-bar" aria-label="主导航">
        <Link to="/" className="brand" aria-label="SFMCL-T 首页">
          <Brand />
        </Link>
        <div className="desktop-links">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/docs">使用文档</NavLink>
          <NavLink to="/changelog">更新日志</NavLink>
          <NavLink to="/download">下载</NavLink>
        </div>
        <div className="nav-actions">
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={`切换到${theme === "light" ? "深色" : "浅色"}模式`}
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <a
            className="icon-button github-nav"
            href={REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="在新标签页打开 GitHub 仓库"
          >
            <Github size={20} />
          </a>
          <Link className="button button-primary nav-download" to="/download">
            <ArrowDownToLine size={16} />
            免费下载
          </Link>
          <button
            className="icon-button mobile-menu-button"
            aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
      <nav
        className="mobile-navigation"
        id="mobile-navigation"
        aria-label="移动端导航"
        data-open={open}
        aria-hidden={!open}
        inert={!open}
      >
        <Link to="/">首页</Link>
        <Link to="/docs">使用文档</Link>
        <Link to="/changelog">更新日志</Link>
        <a href={REPO} target="_blank" rel="noreferrer">
          GitHub <ArrowUpRight size={16} />
        </a>
        <Link to="/download">下载</Link>
      </nav>
    </header>
  );
}

function Footer({ compact = false }: { compact?: boolean } = {}) {
  if (compact) return (
    <footer className="site-footer compact-footer container">
      <div className="footer-links">
        <Link to="/docs">使用文档</Link>
        <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">问题反馈 <ArrowUpRight size={13} /></a>
        <a href={REPO} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} /></a>
      </div>
      <div className="compact-footer-credit">
        <span>© {new Date().getFullYear()} SFMCL-T · MIT 开源</span>
        <a href="https://zh.minecraft.wiki/" target="_blank" rel="noreferrer">素材来源</a>
        <span className="compact-footer-note">该项目与MoJang无关</span>
      </div>
    </footer>
  );
  return (
    <footer className="site-footer container">
      <div className="footer-top">
        <div>
          <Link to="/" className="brand">
            <Brand />
          </Link>
          <p>准备好，下一次冒险。</p>
        </div>
        <div className="footer-links">
          <Link to="/docs">使用文档</Link>
          <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">
            问题反馈 <ArrowUpRight size={13} />
          </a>
          <a href={REPO} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} SFMCL-T · MIT 开源</span>
        <span>
          该项目与MoJang无关。Minecraft 商标归 Mojang 与 Microsoft 所有。
          <a
            className="wiki-credit"
            href="https://zh.minecraft.wiki/"
            target="_blank"
            rel="noreferrer"
          >
            素材来源
          </a>
        </span>
        <span className="mono">
          BUILT FOR YOUR NEXT WORLD <span className="tiny-square" />
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const releaseState = useReleases();
  const { pathname } = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "下一个世界，从这里开始",
      "/download": "下载",
      "/docs": "使用文档",
      "/changelog": "更新日志",
    };
    const currentDocument = docSections.find(({ id }) => pathname === `/docs/${id}`);
    document.title = `SFMCL-T · ${currentDocument ? `${currentDocument.title} · 使用文档` : titles[pathname] || titles["/"]}`;
  }, [pathname]);
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "dark" ? "#111e18" : "#f5f7f1");
    try {
      localStorage.setItem("sfmcl-site-theme", next);
    } catch {
      /* Theme still works without storage. */
    }
  };
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const content = document.getElementById("main-content");
          content?.focus({ preventScroll: true });
          content?.scrollIntoView({ behavior: "instant" });
        }}
      >
        跳转到主要内容
      </a>
      <ScrollManager />
      <PageMotion />
      <Header theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route
          path="/"
          element={<Home theme={theme} releaseState={releaseState} footer={<Footer compact />} />}
        />
        <Route
          path="/download"
          element={<Download releaseState={releaseState} />}
        />
        <Route path="/docs/:documentId?" element={<DocsPage />} />
        <Route
          path="/changelog"
          element={<Changelog releaseState={releaseState} />}
        />
        <Route
          path="*"
          element={<Home theme={theme} releaseState={releaseState} footer={<Footer compact />} />}
        />
      </Routes>
      {(["/download", "/docs", "/changelog"].includes(pathname) || pathname.startsWith("/docs/")) && <Footer />}
    </>
  );
}
