// Section markup and reveal animation copied from SFMCL-ps-astra.
import { useEffect, useRef } from "react";
import { Check, FileArchive, Folder } from "lucide-react";
import "./ImportedModpack.css";

export default function ImportedModpack() {
  const section = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const animations = new Set<Animation>();
    const reveal = (element: HTMLElement) => {
      if (element.dataset.revealed) return;
      element.dataset.revealed = "true";
      const animation = element.animate(
        [
          { opacity: 0, translate: "0 28px" },
          { opacity: 1, translate: "0 0" },
        ],
        {
          duration: 720,
          delay: Number(element.dataset.reveal || 0),
          easing: "cubic-bezier(.16, 1, .3, 1)",
          fill: "backwards",
        },
      );
      animations.add(animation);
      animation.finished.finally(() => animations.delete(animation)).catch(() => {});
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );
    const container = section.current!;
    const targets = container.querySelectorAll<HTMLElement>("[data-reveal]");
    targets.forEach((element) => observer.observe(element));

    // A keyboard user can enter a section before the viewport observer runs.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-reveal]");
      if (target) {
        target.dataset.revealed = "true";
        observer.unobserve(target);
        target.getAnimations().forEach((animation) => animation.finish());
      }
    };
    container.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      container.removeEventListener("focusin", onFocus);
      animations.forEach((animation) => animation.cancel());
      targets.forEach((element) => delete element.dataset.revealed);
    };
  }, []);
  return (
    <div className="astra-modpack" id="modpacks" ref={section}>
        <section className="section container modpack-section">
          <div className="modpack-art" aria-hidden="true" data-reveal="0">
            <div className="package-orbit orbit-a" />
            <div className="package-orbit orbit-b" />
            <div className="floating-file file-a">
              <FileArchive />
              <span>.mrpack</span>
            </div>
            <div className="floating-file file-b">
              <FileArchive />
              <span>.zip</span>
            </div>
            <div className="floating-file file-c">
              <Folder />
              <span>游戏目录</span>
            </div>
            <div className="package-center">
              <img src="./assets/wiki/chest.gif" alt="" width="300" height="300" loading="lazy" />
              <span>DROP IN. PLAY ON.</span>
            </div>
            <span className="import-ready">
              <Check size={14} /> 所有冒险，准备就绪
            </span>
            <span className="art-cross cross-one">+</span>
            <span className="art-cross cross-two">+</span>
          </div>
          <div className="modpack-copy" data-reveal="100">
            <h2>
              一个整合包，
              <br />
              装下整个新世界。
            </h2>
            <p>拖入整合包，让启动器完成准备。</p>
            <ol className="import-steps">
              <li>
                <span>01</span>
                <div>
                  <strong>拖入整合包</strong>
                  <small>本地压缩包、完整客户端目录，或在线整合包</small>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>确认配置</strong>
                  <small>确认版本、加载器与安装位置</small>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>安装并出发</strong>
                  <small>下载并校验文件，合并整合包内容</small>
                </div>
              </li>
            </ol>
            <div className="format-tags">
              <span>MRPACK</span>
              <span>ZIP</span>
            </div>
          </div>
        </section>
    </div>
  );
}
