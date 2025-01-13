import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

// Add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or request already retried, reject
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const errorCode = error.response.data.code;
    
    // Handle different authentication errors
    if (['TOKEN_EXPIRED', 'TOKEN_EXPIRING', 'INVALID_TOKEN'].includes(errorCode)) {
      // Only clear auth and redirect if not already authenticated
      const authenticated = localStorage.getItem('authenticated');
      if (!authenticated) {
        localStorage.removeItem('token');
        localStorage.removeItem('authenticated');
        window.location.href = '/';
      }
      return Promise.reject(error);
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
