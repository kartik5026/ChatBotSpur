import axios from 'axios'

// For local dev with Vite proxy, keep this empty (default) and calls go to same origin.
// For production, set VITE_API_BASE_URL="https://your-backend.com"
const baseURL = import.meta.env.VITE_API_BASE_URL || ''

export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

