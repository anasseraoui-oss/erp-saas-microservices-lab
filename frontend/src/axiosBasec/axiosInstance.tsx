import axios from 'axios';

const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Axios Error:', error);
        return Promise.reject(error);
    }
);
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
