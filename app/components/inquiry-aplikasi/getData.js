import axios from "@/lib/axios";

const buildQuery = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
    });
    return query.toString();
};


export const fetchData = async ({ no_apl }) => {
    try {
        const query = buildQuery({ no_apl: no_apl});
        const { data } = await axios.get(`/inquiry-aplikasi?${query}`);
        if (data.success) return data.data;
    } catch (error) {
        console.error("Error fetching chart data:", error);
    }
};
