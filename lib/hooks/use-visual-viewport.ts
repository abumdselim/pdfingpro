"use client";

import { useEffect, useState } from "react";

interface VisualViewportState {
  height: number | null;
  offsetTop: number;
}

/** Tracks visual viewport size — adjusts when the mobile software keyboard opens. */
export function useVisualViewport(active: boolean): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({ height: null, offsetTop: 0 });

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setState({ height: vv.height, offsetTop: vv.offsetTop });
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [active]);

  return state;
}
