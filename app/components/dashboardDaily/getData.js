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
        const { data } = await axios.get(`/dashboard/grafik`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
};

export const fetchExcelData = async () => {
    try {
        const { data } = await axios.get(`/export/dashbord`,{ timeout: 600000});
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching detail Excel data:", error);
    }
};



