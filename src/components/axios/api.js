import axios from 'axios'
const http = ["http://192.168.1.6:8080/api", "http://localhost:8080/api"]
const API = axios.create({
  baseURL: http[1], 
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
