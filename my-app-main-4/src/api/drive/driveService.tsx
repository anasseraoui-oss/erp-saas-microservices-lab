import { axiosInstance } from '../authService';

const API_BASE_URL = 'http://localhost:9055';

const uploadFile = async (formData: FormData) => {
    // axios will set the correct multipart Content-Type including boundary when used in browser,
    // but our axiosInstance sets a default JSON content-type; override it here.
    const res = await axiosInstance.post(`${API_BASE_URL}/api/drive/upload`, formData);
    return res.data;
};

const listFolders = async () => {
    const res = await axiosInstance.get('/api/drive/folders', { withCredentials: true });
    return res.data;
};

export default {
    uploadFile,
    listFolders
};
