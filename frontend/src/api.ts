import axios from 'axios';
import type { UploadResponse, FileMetadata } from './types';

// Assuming backend is running on default port or proxied
// Adjust baseURL if needed, e.g., 'http://localhost:8000'
const api = axios.create({
    baseURL: '/',
});

export const uploadFile = async (file: File, expirationHours: number = 24, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expiration_hours', expirationHours.toString());

    const response = await api.post<UploadResponse>('/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            }
        },
    });
    return response.data;
};

export const getRecentUploads = async (limit: number = 10): Promise<FileMetadata[]> => {
    const response = await api.get<FileMetadata[]>('/api/recent', {
        params: { limit },
    });
    return response.data;
};

export const getExpiringUploads = async (limit: number = 10): Promise<FileMetadata[]> => {
    const response = await api.get<FileMetadata[]>('/api/expiring', {
        params: { limit },
    });
    return response.data;
};

export default api;
