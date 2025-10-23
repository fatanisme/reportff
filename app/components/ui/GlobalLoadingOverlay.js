"use client";

import { useEffect, useState } from "react";
import { loadingManager } from "@/lib/loadingManager";

export default function GlobalLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe(setIsLoading);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const body = document.querySelector("body");
    if (!body) return;

    if (isLoading) {
      body.classList.add("overflow-hidden");
    } else {
      body.classList.remove("overflow-hidden");
    }

    return () => {
      body.classList.remove("overflow-hidden");
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm pointer-events-auto">
      <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
