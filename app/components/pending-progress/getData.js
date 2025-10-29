import axios from "@/lib/axios";

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.append(key, value);
  });
  return query.toString();
};

const DETAIL_CATEGORIES = [
  { key: "CAIR", flow: "CAIR", modes: ["IN", "LAST"] },
  { key: "CANCEL", flow: "CANCEL", modes: ["IN", "LAST"] },
  { key: "REJECT", flow: "REJECT", modes: ["IN", "LAST"] },
  { key: "HOLD", flow: "HOLD", modes: ["LAST"] },
];

const buildDetailParams = ({
  flowCode,
  mode,
  startDate,
  endDate,
  region,
  area,
}) => {
  const params = new URLSearchParams();
  params.set("flow_code", flowCode);
  params.set("mode", mode);
  if (region && region !== "All") params.set("region", region);
  if (area && area !== "All") params.set("area", area);

  const formatDate = (value) => value;
  const hasCustomRange = Boolean(startDate || endDate);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, "0")}-${`${today.getDate()}`.padStart(2, "0")}`;
  const baseRef = mode === "IN"
    ? endDate || startDate || todayStr
    : endDate || todayStr;

  if (mode === "LAST") {
    if (hasCustomRange) {
      params.set("range", "bounded");
      params.set("rangeStart", startDate || baseRef);
      params.set("rangeEnd", baseRef);
    } else {
      params.set("range", "month");
      params.set("rangeEnd", baseRef);
      const dateObj = new Date(`${baseRef}T00:00:00`);
      if (!Number.isNaN(dateObj.getTime())) {
        dateObj.setDate(1);
        const monthStart = `${dateObj.getFullYear()}-${`${dateObj.getMonth() + 1}`.padStart(2, "0")}-${`${dateObj.getDate()}`.padStart(2, "0")}`;
        params.set("rangeStart", monthStart);
      }
    }
    params.set("refDate", baseRef);
  } else {
    params.set("refDate", baseRef);
    if (hasCustomRange) {
      if (startDate) params.set("startDate", formatDate(startDate));
      if (endDate) params.set("endDate", formatDate(endDate));
    }
  }

  return params.toString();
};

const fetchDetailCount = async (options) => {
  try {
    const query = buildDetailParams(options);
    const { data } = await axios.get(`/grafik/detail-wise?${query}`);
    if (data?.success && Array.isArray(data.data)) {
      return data.data.length;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching summary detail:", error);
    return 0;
  }
};

export const fetchCair = async ({ startDate, endDate, region, area }) => {
  const tasks = DETAIL_CATEGORIES.map(async ({ key, flow, modes }) => {
    const result = { CATEGORY: key, IN: 0, LAST: 0 };
    const counts = await Promise.all(
      modes.map((mode) =>
        fetchDetailCount({
          flowCode: flow,
          mode,
          startDate,
          endDate,
          region,
          area,
        }).then((count) => ({ mode, count }))
      )
    );

    counts.forEach(({ mode, count }) => {
      if (mode === "IN") result.IN = count;
      if (mode === "LAST") result.LAST = count;
    });

    return result;
  });

  return Promise.all(tasks);
};

export const fetchAreas = async ({ region }) => {
  try {
    const query = buildQuery({ kode_region: region });
    const { data } = await axios.get(`/area?${query}`);
    if (data.success) return data.data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
  }
};

export const fetchRegions = async () => {
  try {
    const { data } = await axios.get(`/region`);
    if (data.success) return data.data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
  }
};

export const fetchChartData = async ({ area, region, endDate }) => {
  try {
    const query = buildQuery({
      kode_area: area,
      kode_region: region,
      endDate,
    });
    const { data } = await axios.get(
      query ? `/grafik/pending-progress?${query}` : `/grafik/pending-progress`
    );
    if (data.success) return data.data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
  }
};

export const fetchExcelDetail = async ({
  startDate,
  endDate,
  region,
  area,
}) => {
  try {
    const query = buildQuery({
      startDate,
      endDate,
      kode_region: region,
      kode_area: area,
    });
    const { data } = await axios.get(
      `/export/pending-progress/detail?${query}`  // Tanpa /api karena sudah ada di baseURL
    );
    if (data.success) return data.data;
  } catch (error) {
    console.error("Error fetching detail Excel data:", error);
  }
};

export const fetchExcelProgress = async ({ region, area }) => {
  try {
    const query = buildQuery({ kode_region: region, kode_area: area });
    const { data } = await axios.get(
      `/export/pending-progress/progress?${query}`  // Tanpa /api karena sudah ada di baseURL
    );
    if (data.success) return data.data;
  } catch (error) {
    console.error("Error fetching progress Excel data:", error);
  }
};

export const fetchExcelPending = async ({ region, area }) => {
  try {
    const query = buildQuery({ kode_region: region, kode_area: area });
    const { data } = await axios.get(
      `/export/pending-progress/pending?${query}`  // Tanpa /api karena sudah ada di baseURL
    );
    if (data.success) return data.data;
  } catch (error) {
    console.error("Error fetching pending Excel data:", error);
  }
};
