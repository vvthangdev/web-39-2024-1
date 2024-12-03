
import axiosInstance from "../../config/axios.config";

export const contactAPI = {
    sendContact: (data) => {
        return axiosInstance.post('/contact/create', data); // Đảm bảo rằng bạn đã tạo route này trong backend
    },
    getAllContacts: () => {
        return axiosInstance.get('/contact/getAll');
    }
};