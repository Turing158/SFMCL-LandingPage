interface LoaderMotion {
  frames: Keyframe[];
  options: KeyframeAnimationOptions;
}

const pose = (x: number, y: number, rotation: number, opacity = 1): Keyframe => ({
  transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`,
  opacity,
});

export function loaderMotions(panel: HTMLElement, targets: Element[], entering: boolean): Map<Element, LoaderMotion> {
  const motions = new Map<Element, LoaderMotion>();
  const rope = panel.querySelector(".loader-rope");
  const viewport = panel.querySelector(".loader-ribbon-viewport");
  if (!rope || !viewport) return motions;

  const cards = targets.filter((target) => target.matches(".loader-card"));
  const cardDuration = entering ? 500 : 360;
  cards.forEach((element, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    const rest = pose(0, 0, 0);
    // A short lift and one soft landing keep the hook action legible without
    // long travel, repeated stops or a left-to-right queue of cards.
    const frames: Keyframe[] = entering ? [
      { ...pose(side * 10, 72, side * 6, 0), offset: 0, easing: "cubic-bezier(.22,.8,.3,1)" },
      { ...pose(0, -12, -side * 2), offset: 0.62, easing: "cubic-bezier(.35,0,.25,1)" },
      { ...rest, offset: 1 },
    ] : [
      { ...rest, offset: 0, easing: "cubic-bezier(.3,0,.25,1)" },
      { ...pose(0, -16, -side * 3), offset: 0.3, easing: "cubic-bezier(.4,0,.65,1)" },
      { ...pose(side * 10, 72, side * 6, 0), offset: 1 },
    ];
    motions.set(element, {
      frames,
      options: { duration: cardDuration, delay: entering ? 60 : 0, easing: "linear" },
    });
  });

  // Pull the visible length of rope across the ribbon, keeping the looping
  // track in place so its curves still meet the hooks when the motion ends.
  const line = rope.getBoundingClientRect();
  const view = viewport.getBoundingClientRect();
  const padding = 8;
  const distance = view.width + padding * 2;
  const clipPath = `inset(-8px ${Math.max(0, line.right - view.right - padding)}px -8px ${Math.max(0, view.left - line.left - padding)}px)`;
  const rest: Keyframe = { translate: "0px 0px", clipPath, opacity: 1 };
  motions.set(rope, {
    frames: entering ? [
      { ...rest, translate: `${-distance}px 0px` },
      rest,
    ] : [
      rest,
      { ...rest, translate: `${distance}px 0px` },
    ],
    options: {
      duration: 360,
      // Start pulling away once the cards have lifted clear of their hooks.
      delay: entering ? 0 : cardDuration * 0.3,
      easing: entering ? "cubic-bezier(.22,.75,.25,1)" : "cubic-bezier(.4,0,.8,1)",
    },
  });
  return motions;
}
