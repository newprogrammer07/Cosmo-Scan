// frontend/src/config.ts

// This logic automatically switches:
// 1. In Development (Localhost) -> uses http://localhost:5000
// 2. In Production (Netlify) -> uses the URL you set in Netlify Environment Variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";