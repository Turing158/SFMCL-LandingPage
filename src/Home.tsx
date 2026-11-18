import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  Compass,
  ExternalLink,
  Folder,
  Github,
  Layers3,
  Monitor,
  Palette,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { Theme } from "./App";
import { loaders, REPO, resourceGroups, VERSION } from "./data";
import { Landscape, MinecraftIcon } from "./Scene";
import type { ReleaseState } from "./useReleases";
import LauncherPreview from "./LauncherPreview";
import ImportedModpack from "./ImportedModpack";
import { appearancePalettes } from "./appearancePalettes";
import HomeDeck from "./HomeDeck";

function Hero({
  theme,
  releaseState,
}: {
  theme: Theme;
  releaseState: ReleaseState;
}) {
  const heroGrid = useRef<HTMLDivElement>(null);
  const heroCopy = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = heroGrid.current;
    const copy = heroCopy.current;
    const stage = grid?.closest<HTMLElement>(".deck-stage");
    const hero = grid?.parentElement;
    if (!grid || !copy || !stage || !hero) return;

    const fitPreview = () => {
      const gridStyle = getComputedStyle(grid);
      const heroStyle = getComputedStyle(hero);
      const frame = parseFloat(gridStyle.getPropertyValue("--hero-preview-frame"));
      const availableHeight = stage.clientHeight - copy.offsetHeight
        - parseFloat(heroStyle.paddingTop) - parseFloat(heroStyle.paddingBottom)
        - parseFloat(gridStyle.rowGap) - 2;
      // Fit the original 7:4 window below the actual copy, including its frame.
      const width = Math.max(0, (availableHeight - frame) * 1.75 + frame);
      grid.style.setProperty("--hero-preview-max-width", `${width}px`);
    };
    const observer = new ResizeObserver(fitPreview);
    observer.observe(stage);
    observer.observe(copy);
    fitPreview();
    return () => observer.disconnect();
  }, []);

  const version =
    releaseState.releases
      .find((release) => !release.prerelease)
      ?.tag_name.replace(/^v/, "") || VERSION;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-haze" aria-hidden="true" />
      <div className="hero-particles" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <span className="hero-cross cross-one" aria-hidden="true">
        +
      </span>
      <span className="hero-cross cross-two" aria-hidden="true">
        +
      </span>
      <div className="container hero-grid" ref={heroGrid}>
        <div className="hero-copy" ref={heroCopy}>
          <h1 id="hero-title">
            下一个世界，
            <br />
            <span className="hero-title-accent">
              从这里开始
              <svg viewBox="0 0 420 16" aria-hidden="true">
                <path d="M2 13h25V9h55V5h74V3h109v2h70v4h59v4h23" />
              </svg>
            </span>
            。
          </h1>
          <p className="hero-description">
            选好角色，装好版本，出发。
          </p>
          <div className="hero-buttons">
            <Link to="/download" className="button button-primary">
              <ArrowDownToLine size={18} />
              免费下载 <ArrowRight size={17} />
            </Link>
            <a
              className="button button-outline"
              href={REPO}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={18} />
              看看源码 <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-meta">
            <span className="version-label">
              <span className="status-dot" />v{version}
            </span>
            <span>Windows 10 / 11</span>
            <span>免费开源</span>
          </div>
        </div>
        <div className="hero-preview-column">
          <div className="hero-preview">
            <LauncherPreview theme={theme} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Features({ theme }: { theme: Theme }) {
  const [accent, setAccent] = useState(0);
  const palette = appearancePalettes[accent];
  const colors = palette[theme];
  return (
    <section id="features" className="section features-section">
      <div className="container">
        <div className="section-heading feature-heading">
          <div>
            <h2>
              把准备交给启动器，
              <br />
              把时间留给世界。
            </h2>
          </div>
        </div>
        <div className="feature-grid">
          <article className="feature-card character-feature">
            <div className="card-label">
              <UserRound size={18} />
              <span>角色管理</span>
              <span className="mono">01</span>
            </div>
            <div className="character-visual">
              <div className="avatar-stage">
                <img
                  src="./assets/steve-front.png"
                  width="64"
                  height="128"
                  alt="Minecraft 默认角色像素形象"
                  loading="lazy"
                />
                <span className="stage-shadow" />
              </div>
              <div className="identity-card">
                <span className="mini-label">READY, PLAYER ONE</span>
                <strong>你好，冒险家。</strong>
                <span className="online-label">
                  <span className="status-dot" />
                  下一次出发，还是你。
                </span>
                <div className="identity-tags">
                  <span>Microsoft</span>
                  <span>离线角色</span>
                  <span>第三方登录</span>
                </div>
              </div>
            </div>
            <h3>带着熟悉的自己出发。</h3>
            <p>正版、离线与第三方角色，随时切换。</p>
          </article>
          <article className="feature-card version-feature">
            <div className="card-label">
              <Folder size={18} />
              <span>版本管理</span>
              <span className="mono">02</span>
            </div>
            <div className="world-folders">
              <div>
                <span className="folder-icon">
                  <Folder size={24} />
                </span>
                <span>
                  <strong>原版生存</strong>
                  <small>Vanilla · 独立目录</small>
                </span>
                <Check size={16} />
              </div>
              <div>
                <span className="folder-icon">
                  <Layers3 size={24} />
                </span>
                <span>
                  <strong>模组冒险</strong>
                  <small>Fabric · 独立目录</small>
                </span>
                <Check size={16} />
              </div>
              <span className="folder-path mono">
                .minecraft / versions / your-world
              </span>
            </div>
            <h3>每个世界，各有空间。</h3>
            <p>独立目录、游戏多开，随时切换与管理。</p>
          </article>
          <article className="feature-card download-feature">
            <div className="card-label">
              <ArrowDownToLine size={18} />
              <span>下载管理</span>
              <span className="mono">03</span>
            </div>
            <div className="download-illustration" aria-label="下载流程示意">
              <div>
                <MinecraftIcon size={24} />
                <span>
                  Minecraft<span className="mini-label">游戏与依赖</span>
                </span>
                <Check size={17} />
              </div>
              <div className="illustration-progress">
                <span />
              </div>
              <div className="illustration-caption">
                <span>
                  <ShieldCheck size={13} /> 文件校验
                </span>
                <span>暂停 / 继续 / 重试</span>
              </div>
            </div>
            <h3>下载进度，心中有数。</h3>
            <p>下载中可调整同时下载数，侧栏随时查看进度。</p>
          </article>
          <article
            className="feature-card appearance-feature"
            data-accent={palette.id}
            style={{
              "--palette-accent": colors.accent,
              "--palette-background": colors.bg,
              "--palette-panel": colors.panel,
              "--palette-soft": colors.soft,
              "--palette-line": colors.line,
              "--palette-ink": colors.ink,
              "--palette-sidebar": colors.sidebar,
            } as CSSProperties}
          >
            <div className="card-label">
              <Palette size={18} />
              <span>外观定制</span>
              <span className="mono">04</span>
            </div>
            <div className="appearance-visual">
              <div className="palette-preview" aria-hidden="true">
                <div className="palette-stack" key={palette.id}>
                  <span className="palette-sheet palette-sheet-back" />
                  <span className="palette-sheet palette-sheet-front">
                    <span className="palette-sample" />
                    <span className="palette-stroke" />
                    <span className="palette-stroke palette-stroke-short" />
                    <span className="palette-strip">
                      <i /><i /><i />
                    </span>
                  </span>
                  <span className="palette-chip" />
                </div>
              </div>
              <div className="palette-picker" aria-label="主题配色预览">
                {appearancePalettes.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className="palette-swatch"
                    style={{
                      "--swatch-color": item[theme].accent,
                      "--swatch-ink": item[theme].onAccent,
                    } as CSSProperties}
                    aria-label={`预览${item.name}`}
                    aria-pressed={accent === index}
                    onClick={() => setAccent(index)}
                  >
                    {accent === index && <Check size={15} />}
                  </button>
                ))}
                <span aria-live="polite">{palette.name}</span>
              </div>
            </div>
            <h3>有像素感，也有你的风格。</h3>
            <p>四套主题配色，让界面更像你。</p>
          </article>
        </div>
        <div className="feature-footnote">
          <Link to="/docs" className="text-link">
            看看所有功能 <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Platform() {
  const technologies = [
    { icon: Box, name: "Rust", label: "扎实的核心" },
    { icon: Layers3, name: "Tauri 2", label: "轻巧的桌面体验" },
    { icon: Github, name: "MIT", label: "开源，也自由" },
    { icon: Monitor, name: "Windows", label: "10 / 11 · x64 / x86" },
  ];
  return (
    <section className="section platform-section" id="platform">
      <div className="container">
        <div className="section-heading centered">
          <h2>像素之下，<br />是扎实的准备。</h2>
          <p>为 Minecraft Java 版而打造。</p>
        </div>
        <div className="tech-grid">
          {technologies.map((item) => (
            <article className="tech-card" key={item.name}>
              <item.icon size={38} strokeWidth={1.4} />
              <strong>{item.name}</strong><h3>{item.label}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Loaders() {
  return (
    <section className="section loader-section" id="loaders">
      <div className="container">
        <div className="section-heading centered">
          <h2>原版，或不止原版。</h2>
          <p>六种加载器，让玩法更多一点。</p>
        </div>
        <div className="loader-ribbon" style={{ "--loader-count": loaders.length } as CSSProperties}>
          <div className="loader-ribbon-viewport">
            <div className="loader-rope-track" aria-hidden="true">
              <svg className="loader-rope" viewBox={`0 0 ${(loaders.length * 2 + 1) * 180} 44`} preserveAspectRatio="none">
                <path d={`M0 6 ${Array.from({ length: loaders.length * 2 + 1 }, (_, index) =>
                  `Q${index * 180 + 90} 38 ${(index + 1) * 180} 6`).join(" ")}`} />
              </svg>
            </div>
            <div className="loader-marquee">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  className="loader-group"
                  aria-label={copy === 0 ? "支持的加载器" : undefined}
                  aria-hidden={copy === 1 ? true : undefined}
                >
                  {loaders.map((item, index) => (
                    <li key={item.name} className="loader-card">
                      <span className="loader-eyelet" aria-hidden="true" />
                      <span
                        className="loader-card-face"
                        style={{ animationDelay: `${index * -0.8}s` }}
                      >
                        <span className="loader-icon">
                          <img
                            src={`./assets/loaders/${item.image}`}
                            alt=""
                            width="48"
                            height="48"
                            loading="eager"
                            draggable={false}
                          />
                        </span>
                        <strong>{item.name}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
        <div className="loader-guide">
          <Link to="/docs#versions" className="text-link">了解版本与加载器 <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

function Resources() {
  const [selected, setSelected] = useState(0);
  const group = resourceGroups[selected];
  return (
    <section className="section resource-section" id="resources">
      <div className="container">
        <div className="section-heading resource-heading">
          <div>
            <h2>给世界，加点新鲜感。</h2>
          </div>
          <span className="resource-source">
            <Compass size={16} />
            连接 Modrinth 与 CurseForge
          </span>
        </div>
        <div className="resource-selector" aria-label="选择资源分类">
          {resourceGroups.map((item, index) => (
            <button
              aria-pressed={selected === index}
              key={item.id}
              className={selected === index ? "selected" : ""}
              onClick={() => setSelected(index)}
            >
              {item.name}
              {selected === index && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
        <div className="resource-description" key={group.id} aria-live="polite">
          <h3>{group.heading}</h3>
          <p>{group.description}</p>
        </div>
        <div className="resource-grid" aria-live="polite">
          {group.cards.map((card, index) => (
            <a
              className="resource-card"
              key={card.slug}
              href={`https://modrinth.com/${card.slug === "iris" ? "mod" : group.projectType}/${card.slug}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`${card.localizedName ? card.localizedName.name + " · " : ""}${card.title}（在新标签页打开项目页）`}
            >
              <div className="resource-art resource-project-art" style={{ "--art-tint": card.tint } as CSSProperties}>
                <div className="resource-art-grid" aria-hidden="true" />
                <span className="art-index" aria-hidden="true">0{index + 1}</span>
                <img className="resource-project-icon" src={`./assets/resource-${card.slug}.png`}
                  alt={`${card.title} 项目图标`} width={82} height={82} loading="lazy" decoding="async" />
                <span className="resource-tag">{card.localizedName?.name ?? card.tag}</span>
                <ExternalLink className="resource-art-arrow" size={19} aria-hidden="true" />
              </div>
              <div className="resource-card-copy">
                <h4>{card.title}<ExternalLink size={17} aria-hidden="true" /></h4>
                <p>{card.desc}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="resource-footer">
          <Link to="/docs/resources" className="text-link">
            探索资源中心 <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuickStart() {
  const steps = [
    {
      icon: "steve-head",
      title: "选择你的Steve",
      text: "添加角色，选择登录方式。",
      note: "角色管理",
    },
    {
      icon: "grass-block",
      title: "准备我的世界",
      text: "安装版本与加载器，或导入整合包。",
      note: "版本管理",
    },
    {
      icon: "diamond-sword",
      title: "开始这次冒险",
      text: "配置 Java，确认角色和版本，开始游戏。",
      note: "开始游戏",
    },
  ];
  return (
    <section className="section quickstart-section" id="quickstart">
      <div className="container">
        <div className="section-heading">
          <div>
            <h2>三步，然后出发。</h2>
          </div>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article className="step" key={step.title}>
              <div className="step-top">
                <span className="step-number mono">0{index + 1}</span>
                <MinecraftIcon file={step.icon} size={25} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="step-note">
                <span className="tiny-square" />
                {step.note}
              </span>
            </article>
          ))}
        </div>
        <div className="quickstart-guide">
          <Link to="/docs" className="button button-outline">打开上手指南 <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const questions: [string, ReactNode][] = [
    ["支持哪些系统？", "Windows 10 / 11，提供 x64 与 x86 版本。"],
    ["需要安装 Java 吗？", "需要。在设置中扫描或添加 Java，选择适合游戏版本的环境。"],
    ["支持哪些登录方式？", "Microsoft、离线与第三方登录。第三方账号不能代替正版认证。"],
    ["已有游戏可以导入吗？", <>可以。添加已有游戏目录，或拖入整合包。安装时也能直接添加目标目录。详见<Link to="/docs/modpacks" className="faq-doc-link">导入整合包</Link>。</>],
    [
      "可以同时运行多个游戏吗？",
      <>
        可以。游戏运行后点击启动区的「继续启动」，再选择角色与版本启动另一实例。展开进程列表可查看或结束各个游戏；退出启动器后游戏继续运行，重新打开可恢复管理。操作详见
        <Link to="/docs/java" className="faq-doc-link">启动设置</Link>。
      </>,
    ],
    [
      "如何和好友一起联机？",
      <>
        先统一游戏版本与模组。房主将世界「对局域网开放」，在「联机」页面创建房间并分享邀请码；官方使用 8 位短码，自定义使用完整长码。离线好友加入前，按游戏加载器设置房主的离线联机。步骤详见
        <Link to="/docs/multiplayer" className="faq-doc-link">联机教程</Link>。
      </>,
    ],
  ];
  return (
    <section className="section faq-section" id="faq">
      <div className="container faq-grid">
        <div>
          <h2>
            出发前，
            <br />
            你可能想知道。
          </h2>
          <a
            href={`${REPO}/issues`}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            还有问题？告诉我们 <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="faq-list">
          {questions.map(([question, answer], index) => (
            <details key={question} name="home-faq">
              <summary>
                <span className="mono">0{index + 1}</span>
                <h3>{question}</h3>
                <ChevronRight size={19} />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="cta-section">
      <span className="cta-backdrop" aria-hidden="true" />
      <div className="container cta-inner">
        <div>
          <h2>
            世界已经在那里。
            <br />
            就等你出发。
          </h2>
          <p>免费、开源，为冒险而准备。</p>
          <Link to="/download" className="button button-lime">
            <ArrowDownToLine size={18} />
            下载 SFMCL-T <ArrowRight size={17} />
          </Link>
        </div>
        <div className="cta-art">
          <span className="cta-pixel-word">
            LET'S
            <br />
            PLAY.
          </span>
          <Landscape variant="plains" />
        </div>
      </div>
    </section>
  );
}

export default function Home({
  theme,
  releaseState,
  footer,
}: {
  theme: Theme;
  releaseState: ReleaseState;
  footer: ReactNode;
}) {
  return (
    <HomeDeck slides={[
      { id: "intro", title: "从这里开始", content: <Hero theme={theme} releaseState={releaseState} /> },
      { id: "platform", title: "像素之下", content: <Platform /> },
      { id: "features", title: "准备好冒险", content: <Features theme={theme} /> },
      { id: "modpacks", title: "装下新世界", content: <ImportedModpack /> },
      { id: "loaders", title: "不止原版", content: <Loaders /> },
      { id: "resources", title: "发现新鲜感", content: <Resources /> },
      { id: "quickstart", title: "三步出发", content: <QuickStart /> },
      { id: "faq", title: "出发前的疑问", content: <Faq /> },
      { id: "download", title: "下一次冒险", content: <><Cta />{footer}</> },
    ]} />
  );
}
