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

export const fetchExcelExport = async ({ startDate, endDate }) => {
    try {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        const params = {};

        if (startDate) {
            if (!dateRegex.test(startDate)) {
                console.error("startDate must be in YYYY-MM-DD format");
                throw new Error("startDate must be in YYYY-MM-DD format");
            }
            params.startDate = startDate;
        }

        if (endDate) {
            if (!dateRegex.test(endDate)) {
                console.error("endDate must be in YYYY-MM-DD format");
                throw new Error("endDate must be in YYYY-MM-DD format");
            }
            params.endDate = endDate;
        }

        const query = buildQuery(params);
        const endpoint = query
            ? `grafik/akumulasi-realtime/export?${query}`
            : `grafik/akumulasi-realtime/export`;

        const { data } = await axios.get(endpoint);
        if (data.success) return data.data;
        return null;
    } catch (error) {
        console.error("Error fetching detail Excel data:", error);
        throw error; // Re-throw to be handled by calling function
    }
};
