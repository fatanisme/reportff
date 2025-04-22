import axios from "@/lib/axios";

const buildQuery = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
    });
    return query.toString();
};

export const fetchCair = async () => {
    try {
        const { data } = await axios.get(`/grafik/pending-progress-2`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
};

export const fetchAreas = async ({ region, area }) => {
    try {
        const query = buildQuery({ kode_region: region});
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

export const fetchChartData = async ({ area }) => {
    try {
        const query = buildQuery({ kode_area: area });
        const { data } = await axios.get(`/grafik/pending-progress?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
};

export const fetchExcelDetail = async ({ startDate, endDate, region, area }) => {
    try {
        const query = buildQuery({ startDate, endDate, kode_region: region, kode_area: area });
        const { data } = await axios.get(`/export/pending-progress/detail?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching detail Excel data:", error);
    }
};

export const fetchExcelProgress = async ({ region, area }) => {
    try {
        const query = buildQuery({ kode_region: region, kode_area: area });
        const { data } = await axios.get(`/export/pending-progress/progress?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching progress Excel data:", error);
    }
};

export const fetchExcelPending = async ({ region, area }) => {
    try {
        const query = buildQuery({ kode_region: region, kode_area: area });
        const { data } = await axios.get(`/export/pending-progress/pending?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching pending Excel data:", error);
    }
};


