import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './theme.css'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Dynamically rewrite localhost API base URLs if client is accessing from a remote host
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:3000')) {
    const dynamicBase = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : `http://${window.location.hostname}:3000`;
    config.url = config.url.replace('http://localhost:3000', dynamicBase);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

createRoot(document.getElementById('root')).render(
  <App />,
)
