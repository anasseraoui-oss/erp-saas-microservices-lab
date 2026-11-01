import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9055';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach Authorization header if token exists
axiosInstance.interceptors.request.use(
    config => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Ensure headers object exists
                if (!config.headers) config.headers = {} as any;
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (e) {
            // localStorage may throw in some environments; don't break requests
            console.warn('Failed to read token from localStorage', e);
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor: central logging and passthrough of errors
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ERR_NETWORK') {
            console.error('Network Error: Could not connect to the server. Please check if the backend is running and the URL is correct.');
        } else {
            console.error('Axios Error:', error?.response?.status, error?.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
