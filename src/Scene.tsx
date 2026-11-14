type SceneName = "island" | "cubes" | "tools" | "sunrise";
type LandscapeName = "forest" | "plains" | "sunrise";

const assetRoot = "./assets/minecraft-wiki/";
const landscapes = {
  forest: { file: "forest.webp", width: 960, height: 540 },
  plains: { file: "plains.webp", width: 1200, height: 675 },
  sunrise: { file: "sunrise.webp", width: 800, height: 424 },
};

export function MinecraftIcon({
  file = "grass-block",
  size = 25,
}: {
  file?: string;
  size?: number;
}) {
  return (
    <img
      className="minecraft-icon"
      src={`${assetRoot}${file}.png`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  );
}

function Sprite({
  file,
  className,
  size = 300,
}: {
  file: string;
  className: string;
  size?: number;
}) {
  return (
    <img
      className={`scene-sprite scene-block ${className}`}
      src={`${assetRoot}${file}.png`}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

export function Scene({
  kind = "island",
  className = "",
}: {
  kind?: string;
  className?: string;
}) {
  const scene = kind as SceneName;
  return (
    <div className={`scene scene-${scene} ${className}`} aria-hidden="true">
      {scene === "sunrise" ? (
        <Landscape variant="sunrise" className="scene-photo" />
      ) : (
        <div className="scene-stage">
          <span className="scene-shadow" />
          {scene === "cubes" ? (
            <>
              <Sprite file="diamond-block" className="cube-top" />
              <Sprite file="grass-block" className="cube-left" />
              <Sprite file="stone" className="cube-right" />
            </>
          ) : scene === "tools" ? (
            <>
              <Sprite file="grass-block" className="tool-grass" />
              <Sprite file="stone" className="tool-stone" />
              <Sprite
                file="diamond-pickaxe"
                className="tool-pickaxe"
                size={160}
              />
            </>
          ) : (
            <>
              <Sprite file="grass-block" className="island-back" />
              <Sprite file="grass-block" className="island-left" />
              <Sprite file="grass-block" className="island-right" />
              <img
                className="scene-sprite scene-block island-tree"
                src={`${assetRoot}oak.png`}
                width={802}
                height={808}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </>
          )}
          <span className="scene-sparks spark-one" />
          <span className="scene-sparks spark-two" />
          <span className="scene-sparks spark-three" />
        </div>
      )}
    </div>
  );
}

export function Landscape({
  className = "",
  variant = "forest",
}: {
  className?: string;
  variant?: LandscapeName;
}) {
  const image = landscapes[variant];
  return (
    <div className={`landscape ${className}`} aria-hidden="true">
      <img
        className="landscape-image"
        src={`${assetRoot}${image.file}`}
        width={image.width}
        height={image.height}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
