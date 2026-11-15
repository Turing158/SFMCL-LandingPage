interface CtaMotion {
  frames: Keyframe[];
  options: KeyframeAnimationOptions;
}

function restingPose(element: Element): Keyframe {
  const style = getComputedStyle(element);
  return {
    translate: style.translate === "none" ? "0px 0px" : style.translate,
    rotate: style.rotate === "none" ? "0deg" : style.rotate,
    scale: style.scale === "none" ? "1" : style.scale,
    opacity: style.opacity,
  };
}

export function ctaMotions(panel: HTMLElement, direction: 1 | -1, entering: boolean): Map<Element, CtaMotion> {
  const motions = new Map<Element, CtaMotion>();
  const backdrop = panel.querySelector(".cta-backdrop");
  const landscape = panel.querySelector(".cta-art .landscape");
  const word = panel.querySelector(".cta-pixel-word");
  if (!backdrop || !landscape || !word) return motions;

  // Move the full-width band independently so its contents can arrive in layers.
  const bandRest = restingPose(backdrop);
  motions.set(backdrop, {
    frames: entering ? [
      { ...bandRest, translate: `0px ${direction * 100}%`, opacity: 0 },
      bandRest,
    ] : [
      bandRest,
      { ...bandRest, translate: `0px ${-direction * 100}%`, opacity: 0 },
    ],
    options: {
      duration: entering ? 560 : 460,
      delay: entering ? 0 : 100,
      easing: entering ? "cubic-bezier(.22,1,.36,1)" : "cubic-bezier(.55,.05,.8,.45)",
    },
  });

  const landscapeRest = restingPose(landscape);
  motions.set(landscape, {
    frames: entering ? [
      { ...landscapeRest, translate: `${direction * 64}px 28px`, scale: "0.94", opacity: 0 },
      landscapeRest,
    ] : [
      landscapeRest,
      { ...landscapeRest, translate: `${-direction * 64}px -24px`, scale: "0.94", opacity: 0 },
    ],
    options: {
      duration: entering ? 560 : 400,
      delay: entering ? 80 : 40,
      easing: entering ? "cubic-bezier(.16,1,.3,1)" : "cubic-bezier(.55,.05,.8,.45)",
    },
  });

  // Preserve the paused float and CSS tilt when handing back to ambient motion.
  const wordRest = restingPose(word);
  motions.set(word, {
    frames: entering ? [
      { translate: `0px ${direction * 64}px`, rotate: `${direction * 6}deg`, scale: "0.78", opacity: 0, offset: 0, easing: "cubic-bezier(.16,1,.3,1)" },
      { translate: "0px -8px", rotate: "-2deg", scale: "1.04", opacity: 1, offset: 0.72, easing: "ease-in-out" },
      { ...wordRest, offset: 1 },
    ] : [
      wordRest,
      { translate: `0px ${-direction * 56}px`, rotate: `${-direction * 6}deg`, scale: "0.86", opacity: 0 },
    ],
    options: { duration: entering ? 640 : 360, delay: entering ? 160 : 0, easing: entering ? "linear" : "cubic-bezier(.55,.05,.8,.45)" },
  });
  return motions;
}
