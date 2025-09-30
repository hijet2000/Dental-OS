

/**
 * A placeholder for a generic backend API service.
 * In a real application, this would be the central place for making authenticated
 * fetch requests to your backend, handling errors, refreshing tokens, etc.
 * The other services in this demo are self-contained with mock data, so this
 * service is not actively used, but it demonstrates a common pattern.
 */

const API_BASE_URL = 'https://api.example.com';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    // In a real app, you'd get the token from an auth service
    'Authorization': `Bearer fake-jwt-token`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
      // Handle HTTP errors (e.g., 4xx, 5xx)
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`[BackendApiService] Error fetching ${endpoint}:`, error);
    // Re-throw the error so the calling code can handle it
    throw error;
  }
}

export const backendApiService = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};