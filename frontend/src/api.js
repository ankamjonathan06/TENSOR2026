import axios from 'axios';

const API_BASE = 'https://tensoradaptzip.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 120000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Health check
export const checkHealth = () => api.get('/health');

// Compress with file upload
export const compressFile = (file, options = {}) => {
  const formData = new FormData();
  formData.append('dataset', file);
  formData.append('fidelityThreshold', options.fidelityThreshold || 0.001);
  formData.append('targetReduction', options.targetReduction || 40);
  formData.append('lossless', options.lossless || false);

  return api.post('/compress', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000
  });
};

// Demo compression
export const demoCompress = (datasetType) =>
  api.post('/demo/compress', { datasetType });

// Get job status
export const getJob = (jobId) => api.get(`/jobs/${jobId}`);

// Get all jobs
export const getAllJobs = () => api.get('/jobs');

// Get stats
export const getStats = () => api.get('/stats');

export default api;
