import axios from 'axios';

let endpoint = process.env.NEXT_LOCAL_API_URL || 'http://localhost:3001/api';
if (process.env.NODE_ENV === 'production') {
  endpoint = process.env.NEXT_PUBLIC_API_URL || endpoint;
}

const api = axios.create({
  baseURL: endpoint,
  withCredentials: true,
});

export default api;
