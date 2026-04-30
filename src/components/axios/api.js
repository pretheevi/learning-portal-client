import axios from 'axios'
const BASE_URLS = ["http://localhost:8080/api"]
const API = axios.create({
  baseURL: BASE_URLS[0], 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if(token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default API
