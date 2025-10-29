import axios from "@/lib/axios";

const buildQuery = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
    });
    return query.toString();
};


export const fetchData = async ({ no_apl, platform = "WISE" }) => {
    try {
        const query = buildQuery({ no_apl, platform });
        const { data } = await axios.get(`/inquiry-aplikasi?${query}`);
        return data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
        throw error;
    }
};
