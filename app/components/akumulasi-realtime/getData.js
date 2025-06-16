import axios from "@/lib/axios";

const buildQuery = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
    });
    return query.toString();
};

export const fetchChartData = async () => {
    try {
        const { data } = await axios.get(`/grafik/akumulasi-realtime/chart`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
};

export const fetchExcelExport = async ({ startDate, endDate}) => {
    try {
        const query = buildQuery({ startDate, endDate});
        const { data } = await axios.get(`grafik/akumulasi-realtime/export/?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching detail Excel data:", error);
    }
};



