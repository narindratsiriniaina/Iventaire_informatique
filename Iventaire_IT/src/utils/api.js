import axios from 'axios';

// Dynamically determine the backend base URL.
// If accessing from another machine on the network, use the current host's IP/hostname.
export const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `http://${window.location.hostname}:3000`;

const api = axios.create({
  baseURL: API_BASE_URL
});

export default api;
