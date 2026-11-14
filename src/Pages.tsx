import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  FileBox,
  Github,
  Info,
  Monitor,
  Package,
  RefreshCw,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { RELEASES, REPO, VERSION } from "./data";
import { Landscape } from "./Scene";
import type { ReleaseState } from "./useReleases";

function ReleaseFeedback({ releaseState }: { releaseState: ReleaseState }) {
  if (releaseState.loading)
    return (
      <div className="release-feedback" role="status">
        <span className="loading-dot" />
        正在获取 GitHub 发布信息…
      </div>
    );
  if (releaseState.error)
    return (
      <div className="release-feedback feedback-error" role="status">
        <Info size={17} />
        <span>{releaseState.error}</span>
        <button className="text-link" onClick={releaseState.retry}>
          <RefreshCw size={14} />
          重试
        </button>
      </div>
    );
  if (!releaseState.releases.length)
    return (
      <div className="release-feedback">
        <Info size={17} />
        暂未找到已发布版本，可在 GitHub 查看项目最新进展。
      </div>
    );
  return null;
}

export function Download({ releaseState }: { releaseState: ReleaseState }) {
  const [architecture, setArchitecture] = useState<"x64" | "x86">("x64");
  const release = releaseState.releases.find((item) => !item.prerelease);
  const packages = [
    {
      id: "installer",
      icon: Package,
      name: "安装版",
      label: "第一次使用，推荐选这个",
      text: "跟随安装向导完成设置。缺少 WebView2 时，安装器可联网下载环境。",
      file: new RegExp(`[_-]${architecture}[_-]installer\\.exe$`, "i"),
    },
    {
      id: "single",
      icon: FileBox,
      name: "单文件版",
      label: "直接打开，轻松出发",
      text: "下载 EXE 后直接运行。请先确认系统已安装 WebView2 Runtime。",
      file: new RegExp(`[_-]${architecture}\\.exe$`, "i"),
    },
  ];
  return (
    <main id="main-content" tabIndex={-1} className="inner-page download-page">
      <div className="container">
        <div className="page-heading centered">
          <h1>下一次冒险，从下载开始。</h1>
          <p>
            选一个适合你的版本。
            <br />
            免费、开源，为 Minecraft Java 版而打造。
          </p>
          <span className="version-label">
            <span className="status-dot" />
            {release
              ? `${release.tag_name} · 最新稳定版`
              : `v${VERSION} · 当前项目版本`}
          </span>
        </div>
        <div className="architecture-control">
          <span>
            <Monitor size={17} />
            Windows 10 / 11
          </span>
          <div aria-label="选择处理器架构">
            <button
              aria-pressed={architecture === "x64"}
              className={architecture === "x64" ? "selected" : ""}
              onClick={() => setArchitecture("x64")}
            >
              x64 · 64 位
            </button>
            <button
              aria-pressed={architecture === "x86"}
              className={architecture === "x86" ? "selected" : ""}
              onClick={() => setArchitecture("x86")}
            >
              x86 · 32 位
            </button>
          </div>
        </div>
        <ReleaseFeedback releaseState={releaseState} />
        <div className="download-options">
          {packages.map((item) => {
            const asset = release?.assets.find((file) =>
              item.file.test(file.name),
            );
            return (
              <article className="download-option" key={item.id}>
                <span className="package-icon">
                  <item.icon size={30} />
                </span>
                {item.id === "installer" && (
                  <span className="recommended">推荐</span>
                )}
                <span className="mini-label">
                  WINDOWS / {architecture.toUpperCase()}
                </span>
                <h2>{item.name}</h2>
                <strong>{item.label}</strong>
                <p>{item.text}</p>
                <div
                  className="download-file"
                  key={architecture}
                  aria-live="polite"
                >
                  {asset ? (
                    <>
                      <span className="mono">{asset.name}</span>
                      <small>{(asset.size / 1024 / 1024).toFixed(1)} MB</small>
                    </>
                  ) : (
                    <span>
                      {releaseState.loading
                        ? "正在查找发布文件…"
                        : "前往 GitHub 查看可用发布文件"}
                    </span>
                  )}
                </div>
                <a
                  className={`button ${item.id === "installer" ? "button-primary" : "button-outline"}`}
                  href={asset?.browser_download_url || RELEASES}
                  target="_blank"
                  rel="noreferrer"
                >
                  {asset ? <ArrowDownToLine size={17} /> : <Github size={17} />}
                  {asset ? `下载 ${item.name}` : "前往 GitHub 下载"}
                  <ArrowUpRight size={15} />
                </a>
              </article>
            );
          })}
        </div>
        <div className="download-notes">
          <div>
            <ShieldCheck size={20} />
            <strong>运行前，检查两件小事。</strong>
          </div>
          <p>
            Minecraft 所需的 Java 需另行安装。单文件版还需要系统已安装{" "}
            <a
              href="https://developer.microsoft.com/microsoft-edge/webview2/"
              target="_blank"
              rel="noreferrer"
            >
              WebView2 Runtime <ExternalLink size={12} />
            </a>
            。
          </p>
          <p>
            x64 适用于 Windows 10 / 11 64 位系统；x86 适用于 Windows 10 32
            位系统，也可在 64 位 Windows 上运行。
          </p>
          <Link to="/docs" className="text-link">
            下载后怎么开始？看看上手指南 <ArrowRight size={15} />
          </Link>
        </div>
        <div className="download-source">
          <div>
            <Terminal size={22} />
            <span>
              <strong>喜欢自己动手？</strong>
              <small>从源码运行，或为项目贡献一个新想法。</small>
            </span>
          </div>
          <a href={REPO} target="_blank" rel="noreferrer" className="text-link">
            查看源码与开发说明 <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <Landscape className="download-landscape" />
    </main>
  );
}

export function Changelog({ releaseState }: { releaseState: ReleaseState }) {
  return (
    <main id="main-content" tabIndex={-1} className="inner-page changelog-page">
      <div className="container narrow-container">
        <div className="page-heading">
          <h1>每一步，都向新世界靠近。</h1>
          <p>这里展示项目在 GitHub 上发布的版本与更新记录。</p>
        </div>
        <ReleaseFeedback releaseState={releaseState} />
        <div className="release-timeline">
          {releaseState.releases.map((release) => (
            <article className="release-entry" key={release.id}>
              <div className="release-date">
                <span className="timeline-dot" />
                {release.published_at
                  ? new Intl.DateTimeFormat("zh-CN", {
                      dateStyle: "medium",
                      timeZone: "Asia/Shanghai",
                    }).format(new Date(release.published_at))
                  : "发布时间待确认"}
              </div>
              <div className="release-entry-content">
                <div className="release-entry-heading">
                  <h2>{release.name || release.tag_name}</h2>
                  <span className="version-label">
                    {release.prerelease ? "预发布" : "稳定版"}
                  </span>
                </div>
                <div className="release-body">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div
                          className="release-table-scroll"
                          role="region"
                          aria-label="更新日志表格"
                          tabIndex={0}
                        >
                          <table>{children}</table>
                        </div>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} target="_blank" rel="noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {release.body ||
                      "此版本未提供文字更新说明，请前往 GitHub 查看发布详情与文件。"}
                  </Markdown>
                </div>
                <a
                  href={release.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  查看发布详情 <ArrowUpRight size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
        <a
          href={RELEASES}
          target="_blank"
          rel="noreferrer"
          className="button button-outline"
        >
          <Github size={17} />
          查看全部 GitHub Releases <ArrowUpRight size={15} />
        </a>
      </div>
    </main>
  );
}
