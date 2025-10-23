// lib/axios.js
import axios from 'axios';
import { loadingManager } from './loadingManager';

const axiosInstance = axios.create({
  baseURL: (typeof window !== 'undefined' ? '' : process.env.API_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (typeof window !== 'undefined') {
  axiosInstance.interceptors.request.use(
    (config) => {
      loadingManager.increment();
      return config;
    },
    (error) => {
      loadingManager.decrement();
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      loadingManager.decrement();
      return response;
    },
    (error) => {
      loadingManager.decrement();
      return Promise.reject(error);
    }
  );
}


export default axiosInstance;
