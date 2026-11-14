import { useEffect, useState } from "react";

export interface ReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
}
export interface Release {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  assets: ReleaseAsset[];
}
export interface ReleaseState {
  releases: Release[];
  loading: boolean;
  error: string;
  retry: () => void;
}

export function useReleases(): ReleaseState {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    setLoading(true);
    setError("");
    fetch(
      "https://api.github.com/repos/Turing158/SFMCL-Transformed/releases?per_page=10",
      {
        signal: controller.signal,
        headers: { Accept: "application/vnd.github+json" },
      },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("暂时无法获取 GitHub 发布信息。");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("发布信息格式有误。");
        const valid = data.filter(
          (item): item is Release =>
            !!item &&
            typeof item === "object" &&
            !item.draft &&
            typeof item.tag_name === "string" &&
            Array.isArray(item.assets),
        );
        if (alive) setReleases(valid);
      })
      .catch(() => {
        if (alive) setError("暂时无法获取发布信息，你仍可前往 GitHub 下载。");
      })
      .finally(() => {
        window.clearTimeout(timer);
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [attempt]);
  return {
    releases,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  };
}
