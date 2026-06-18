"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHashOrTop() {
  const hash = window.location.hash;
  if (!hash) {
    window.scrollTo(0, 0);
    return;
  }
  const id = hash.slice(1);
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    scrollToHashOrTop();
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToHashOrTop);
    return () => window.removeEventListener("hashchange", scrollToHashOrTop);
  }, []);

  return null;
}
