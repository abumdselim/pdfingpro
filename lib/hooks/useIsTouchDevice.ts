"use client";

import { useEffect, useState } from "react";
import { isTouchDevice } from "@/lib/touch-utils";

/** Client-only touch detection (SSR-safe). */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  return isTouch;
}
