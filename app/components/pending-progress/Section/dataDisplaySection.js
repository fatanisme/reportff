import React, { useMemo } from "react";
import Chart from "../../ui/Chart";
import LoadingOverlay from "../../ui/LoadingOverlay";

const numberFormatter = new Intl.NumberFormat("id-ID");

const DETAIL_FLOW_CODE_MAP = {
  CAIR: "LIVE",
  CANCEL: "CANCEL",
  REJECT: "REJECT",
  HOLD: "HOLD",
};

const CARD_CONFIGS = [
  {
    id: "cair-in",
    category: "CAIR",
    mode: "IN",
    label: "Cair (Hari Ini)",
    className: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
  },
  {
    id: "cair-last",
    category: "CAIR",
    mode: "LAST",
    label: "Cair (Bulan Ini)",
    className: "bg-emerald-500 text-white hover:bg-emerald-600",
  },
  {
    id: "cancel-in",
    category: "CANCEL",
    mode: "IN",
    label: "Cancel (Hari Ini)",
    className: "bg-rose-100 text-rose-900 hover:bg-rose-200",
  },
  {
    id: "cancel-last",
    category: "CANCEL",
    mode: "LAST",
    label: "Cancel (Bulan Ini)",
    className: "bg-rose-500 text-white hover:bg-rose-600",
  },
  {
    id: "reject-in",
    category: "REJECT",
    mode: "IN",
    label: "Reject (Hari Ini)",
    className: "bg-red-100 text-red-900 hover:bg-red-200",
  },
  {
    id: "reject-last",
    category: "REJECT",
    mode: "LAST",
    label: "Reject (Bulan Ini)",
    className: "bg-red-500 text-white hover:bg-red-600",
  },
  {
    id: "hold-last",
    category: "HOLD",
    mode: "LAST",
    label: "Hold (Bulan Ini)",
    className: "bg-amber-300 text-amber-900 hover:bg-amber-400",
  },
];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCount = (value) => numberFormatter.format(Math.max(0, toNumber(value)));

const formatDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const computeMonthStart = (targetDateString, fallbackString) => {
  const reference = targetDateString || fallbackString;
  const candidate = reference ? new Date(`${reference}T00:00:00`) : new Date();
  if (Number.isNaN(candidate.getTime())) {
    return fallbackString;
  }
  candidate.setDate(1);
  return formatDate(candidate) || fallbackString;
};

export default function DataDisplaySection({
  dataChart,
  isLoading,
  region,
  area,
  startDate,
  endDate,
  summaryData = [],
  isSummaryLoading = false,
}) {
  const hasData = Array.isArray(dataChart) && dataChart.length > 0;
  const isChartLoading = Boolean(isLoading);

  const categoryMap = useMemo(() => {
    const map = {};
    (summaryData || []).forEach((item) => {
      const category = item?.CATEGORY?.toUpperCase();
      if (category) {
        map[category] = item;
      }
    });
    return map;
  }, [summaryData]);

  const openDetail = (config) => {
    const categoryData = categoryMap[config.category];
    const rawValue = toNumber(categoryData?.[config.mode]);
    if (rawValue <= 0 || isChartLoading || isSummaryLoading) {
      return;
    }

    const flowCodeParam = DETAIL_FLOW_CODE_MAP[config.category] || config.category;
    const params = new URLSearchParams();
    params.set("flow_code", (flowCodeParam || "").toUpperCase());
    params.set("mode", config.mode.toUpperCase());
    if (region && region !== "All") params.set("region", region);
    if (area && area !== "All") params.set("area", area);

    const todayStr = formatDate(new Date());
    const hasCustomRange = Boolean(startDate || endDate);

    if (hasCustomRange) {
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
    }

    const baseRefDate = config.mode === "IN"
      ? endDate || startDate || todayStr
      : endDate || todayStr;

    if (config.mode === "LAST") {
      params.set("range", hasCustomRange ? "bounded" : "month");
      const rangeEnd = baseRefDate || todayStr;
      const monthStartDate = hasCustomRange
        ? startDate || rangeEnd
        : computeMonthStart(rangeEnd, todayStr);
      params.set("rangeStart", monthStartDate || rangeEnd);
      params.set("rangeEnd", rangeEnd);
      params.set("refDate", rangeEnd);
    } else {
      params.set("refDate", baseRefDate || todayStr);
    }

    window.open(`/grafik/pending-&-progress/detail-wise?${params.toString()}`, "_blank");
  };

  const renderCardValue = (config) => {
    const categoryData = categoryMap[config.category];
    if (!categoryData) return "0";
    const rawValue = categoryData?.[config.mode] ?? 0;
    return formatCount(rawValue);
  };

  return (
    <div className="relative mt-6 grid grid-cols-1 gap-4">
      <div className={isChartLoading || isSummaryLoading ? "pointer-events-none opacity-70" : ""}>
        {hasData ? (
          <Chart
            data={dataChart}
            filters={{ region, area, startDate, endDate }}
          />
        ) : (
          <div className="flex h-96 items-center justify-center rounded border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">
              Data belum tersedia. Silakan tekan tombol Tampilkan.
            </p>
          </div>
        )}
      </div>
      <LoadingOverlay show={isChartLoading || isSummaryLoading} />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
        {CARD_CONFIGS.map((config) => {
          const disabled = isSummaryLoading || toNumber(categoryMap[config.category]?.[config.mode]) <= 0;
          return (
            <button
              key={config.id}
              type="button"
              onClick={() => openDetail(config)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center rounded-lg px-3 py-4 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${config.className} ${
                disabled ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wide opacity-80">
                {config.label}
              </span>
              <span className="mt-2 text-2xl font-bold">
                {renderCardValue(config)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
