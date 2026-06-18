"use client";

import { useEffect } from "react";

/**
 * Production builds register /sw.js via next-pwa. If the browser keeps that
 * worker while `next dev` runs, it serves stale hashed chunks and the app breaks.
 * Unregister and clear caches on every load in development.
 */
export default function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
        if (cancelled) return;

        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
      } catch {
        // Non-fatal in dev
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
