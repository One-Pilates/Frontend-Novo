import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_API,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

function normalizeToken(rawToken) {
  if (!rawToken) return '';

  const semAspas = rawToken.trim().replace(/^"|"$/g, '');
  if (!semAspas) return '';

  return semAspas.toLowerCase().startsWith('bearer ')
    ? semAspas.substring(7).trim()
    : semAspas;
}

function isAuthenticationFailure(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const msg = typeof data === 'string' ? data : data?.message || data?.erro || '';

  if (status === 401) return true;
  if (status === 400 && /authentication failed|unauthorized|token/i.test(String(msg))) return true;
  return false;
}

function clearSessionAndRedirect() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (e) {
    console.warn('Falha ao limpar localStorage:', e);
  }
  window.location.href = '/login';
}

// Adiciona o token de autenticação a cada requisição, se disponível
api.interceptors.request.use((config) => {
  const token = normalizeToken(localStorage.getItem('token'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepta respostas para lidar com erros globais,
// caso o token expire ou seja inválido desloga o usuário
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAuthenticationFailure(error)) {
      clearSessionAndRedirect();
    }
    return Promise.reject(error);
  },
);

export default api;
