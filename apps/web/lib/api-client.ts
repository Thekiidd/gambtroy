const isProd = process.env.NODE_ENV === 'production';
const BASE_URL = isProd ? 'https://gambtroy.onrender.com/api/v1' : 'http://localhost:3001/api/v1';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, data: any) {
    super(data.message || 'API Error');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function fetchClient(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}

export const apiClient = {
  get: (endpoint: string, options?: RequestInit) => fetchClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body: any, options?: RequestInit) => fetchClient(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body: any, options?: RequestInit) => fetchClient(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint: string, body: any, options?: RequestInit) => fetchClient(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string, options?: RequestInit) => fetchClient(endpoint, { ...options, method: 'DELETE' }),
};
