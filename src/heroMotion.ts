interface HeroMotion {
  frames: Keyframe[];
  options: KeyframeAnimationOptions;
}

const pose = (x: number, y: number, rotation = 0): Keyframe => ({
  transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`,
  opacity: 1,
});

// Sample gravity and diminishing rebounds once; the compositor plays the path.
function fallingFrames(distance: number): Keyframe[] {
  const duration = 0.94;
  const fallTime = 0.54;
  const gravity = 2 * distance / (fallTime * fallTime);
  const restitution = 0.24;
  const times = new Set(Array.from({ length: 49 }, (_, i) => i / 48 * duration));
  let impact = fallTime;
  let velocity = gravity * fallTime * restitution;
  times.add(impact);
  for (let bounce = 0; bounce < 3; bounce++) {
    times.add(impact + velocity / gravity);
    impact += 2 * velocity / gravity;
    times.add(impact);
    velocity *= restitution;
  }
  return [...times].sort((a, b) => a - b).map((time) => {
    let y = -distance + gravity * time * time / 2;
    if (time > fallTime) {
      let elapsed = time - fallTime;
      let speed = gravity * fallTime * restitution;
      y = 0;
      for (let bounce = 0; bounce < 3; bounce++) {
        const flight = 2 * speed / gravity;
        if (elapsed < flight) {
          y = -speed * elapsed + gravity * elapsed * elapsed / 2;
          break;
        }
        elapsed -= flight;
        speed *= restitution;
      }
    }
    return { ...pose(0, y, -5 * Math.max(0, 1 - time / fallTime)), offset: time / duration };
  });
}

export function heroMotions(panel: HTMLElement, entering: boolean): Map<Element, HeroMotion> {
  const motions = new Map<Element, HeroMotion>();
  const copy = panel.querySelector<HTMLElement>(".hero-copy");
  const preview = panel.querySelector<HTMLElement>(".launcher-preview-slot");
  if (!copy || !preview) return motions;

  const text = copy.getBoundingClientRect();
  const screen = preview.getBoundingClientRect();
  const stage = panel.getBoundingClientRect();
  // Match the rendered layout, including the compact landscape breakpoint.
  const horizontal = text.right <= screen.left + 1 || screen.right <= text.left + 1;
  const offTop = stage.top - text.bottom - Math.hypot(text.width, text.height) * 0.15 - 48;
  const rest = pose(0, 0);
  let frames: Keyframe[];
  let duration: number;

  if (horizontal && entering) {
    const offLeft = stage.left - text.right - Math.hypot(text.width, text.height) / 2 - 48;
    frames = [
      { ...pose(offLeft, 64, -14), offset: 0, easing: "cubic-bezier(.16,.8,.3,1)" },
      { ...pose(36, -24, 4), offset: 0.58, easing: "cubic-bezier(.3,0,.3,1)" },
      { ...pose(-9, 6, -1), offset: 0.82, easing: "ease-out" },
      { ...rest, offset: 1 },
    ];
    duration = 850;
  } else if (horizontal) {
    const centerX = stage.left + stage.width / 2 - (text.left + text.width / 2);
    const centerY = stage.top + stage.height / 2 - (text.top + text.height / 2);
    frames = [
      { ...rest, offset: 0, easing: "cubic-bezier(.22,.7,.2,1)" },
      { ...pose(centerX, centerY, -2), offset: 0.48, easing: "ease-in-out" },
      { ...pose(centerX, centerY, 0), offset: 0.58, easing: "cubic-bezier(.55,0,1,.55)" },
      { ...pose(centerX, offTop, 7), opacity: 0, offset: 1 },
    ];
    duration = 720;
  } else if (entering) {
    frames = fallingFrames(-offTop);
    duration = 940;
  } else {
    const pull = Math.min(80, Math.max(36, text.height * 0.22));
    frames = [
      { ...rest, offset: 0, easing: "cubic-bezier(.2,.8,.35,1)" },
      { ...pose(0, pull, -2), offset: 0.38, easing: "ease-in-out" },
      { ...pose(0, pull + 4), offset: 0.48, easing: "cubic-bezier(.6,0,1,.55)" },
      { ...pose(0, offTop, 4), opacity: 0, offset: 1 },
    ];
    duration = 640;
  }

  motions.set(copy, { frames, options: { duration, delay: 0, easing: "linear" } });
  // Never translate, rotate or scale the live application during chapter changes.
  motions.set(preview, {
    frames: entering ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: entering ? 620 : 300, delay: entering ? 100 : 0, easing: "ease-in-out" },
  });
  return motions;
}
