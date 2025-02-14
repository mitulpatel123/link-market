import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    // Don't add 'Bearer' prefix if it's already there
    config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on 401 errors
      localStorage.removeItem('token');
      localStorage.removeItem('authenticated');
      localStorage.removeItem('mainPin');
      
      // Only redirect if we're not already on the auth page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  auth: {
    verifyCode: (code: string) => axios.post(`${API_URL}/auth/verify-code`, { code }),
    updatePin: (newPin: string) => axios.post(`${API_URL}/auth/update-pin`, { newPin }),
    verifyDiaryPin: (pin: string) => axios.post(`${API_URL}/auth/verify-diary-pin`, { pin }),
    updateDiaryPin: (currentPin: string, newPin: string) => 
      axios.post(`${API_URL}/auth/update-diary-pin`, { currentPin, newPin }),
    changeMainPin: (data: { currentPin: string; newPin: string }) =>
      axios.post(`${API_URL}/auth/change-main-pin`, data),
    changeDiaryPin: (data: { currentPin: string; newPin: string }) =>
      axios.post(`${API_URL}/auth/change-diary-pin`, data),
  },
  headings: {
    getAll: () => axios.get(`${API_URL}/headings`),
    create: (data: { title: string; description?: string }) =>
      axios.post(`${API_URL}/headings`, data),
    update: (id: string, data: { title: string; description?: string }) =>
      axios.put(`${API_URL}/headings/${id}`, data),
    delete: (id: string) => axios.delete(`${API_URL}/headings/${id}`),
  },
  websites: {
    getAll: () => axios.get(`${API_URL}/websites`),
    create: (data: { name: string; url: string; headingId: string }) =>
      axios.post(`${API_URL}/websites`, data),
    update: (id: string, data: { name: string; url: string; headingId: string }) =>
      axios.put(`${API_URL}/websites/${id}`, data),
    delete: (id: string) => axios.delete(`${API_URL}/websites/${id}`),
  },
  diary: {
    getAll: () => axios.get(`${API_URL}/diary`),
    create: (data: { title: string; content: string; headingId: string; date: string }) =>
      axios.post(`${API_URL}/diary`, data),
    update: (id: string, data: { title: string; content: string; headingId: string; date: string }) =>
      axios.put(`${API_URL}/diary/${id}`, data),
    delete: (id: string) => axios.delete(`${API_URL}/diary/${id}`),
    toggle: (id: string) => axios.patch(`${API_URL}/diary/${id}/toggle`),
  },
  tasks: {
    getAll: () => axios.get(`${API_URL}/tasks`),
    create: (data: { description: string; taskDate: Date; headingId: string }) => 
      axios.post(`${API_URL}/tasks`, data),
    update: (id: string, data: { description: string; taskDate: Date; headingId: string; completed: boolean }) => 
      axios.put(`${API_URL}/tasks/${id}`, data),
    delete: (id: string) => axios.delete(`${API_URL}/tasks/${id}`),
  },
};

export default api;
