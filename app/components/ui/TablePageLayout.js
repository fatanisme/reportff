import React from "react";

export default function TablePageLayout({
  title,
  description,
  actions,
  children,
  className = "",
  actionsPlacement = "right",
}) {
  const isBottom = actionsPlacement === "bottom";

  return (
    <div className={`min-h-screen bg-slate-100 p-6 ${className}`.trim()}>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            {title && <h1 className="text-xl font-semibold text-slate-900">{title}</h1>}
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          {!isBottom && actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>
        {isBottom && actions && (
          <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}
