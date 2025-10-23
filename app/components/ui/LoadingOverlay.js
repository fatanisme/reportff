"use client";

import React from "react";

export default function LoadingOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
      <div className="animate-spin h-8 w-8 border-2 border-gray-400 border-t-transparent rounded-full"></div>
    </div>
  );
}



