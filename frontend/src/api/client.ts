import axios from 'axios'
import { API_BASE } from '../lib/utils'

// In dev, Vite proxies /api → backend (VITE_API_URL blank).
// In production, set VITE_API_URL=https://your-backend.onrender.com
const apiClient = axios.create({ baseURL: API_BASE })

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  r => r,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
