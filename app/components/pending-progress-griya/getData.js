import axios from "@/lib/axios";

const buildQuery = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
    });
    return query.toString();
};

export const fetchCair = async ({ region, area }) => {
    try {
        const query = buildQuery({ kode_region: region, kode_area: area });
        const { data } = await axios.get(`/griya/pending-progress-cair?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
};

export const fetchAreas = async ({ region }) => {
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
        const { data } = await axios.get(`/griya/pending-progress?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
};

export const fetchExcelDetail = async ({ startDate, endDate, region, area }) => {
    try {
        const query = buildQuery({ startDate, endDate, kode_region: region, kode_area: area });
        const { data } = await axios.get(`/export/pending-progress-griya?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching detail Excel data:", error);
    }
};



