/**
 * Gets the base URL for API requests that works in all environments
 * - In development: uses VITE_API_URL from .env file
 * - In production/preview: uses relative URL (automatically uses same origin)
 */
export const getApiBaseUrl = (): string => {
  // If we have an explicit API URL from environment vars, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, use a relative URL (will use the same origin)
  return '';
};

/**
 * Creates a full API URL for a specific endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
}; 