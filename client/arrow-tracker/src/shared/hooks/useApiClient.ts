import apiService, { ApiOptions } from '../services/apiService';
import apiCacheService from '../services/apiCacheService';
import { useAuth } from '../../features/auth/hooks/useAuth';

/**
 * Options for API requests including caching behavior
 */
export interface ApiClientOptions extends ApiOptions {
  /**
   * Whether to cache the response
   */
  cache?: boolean;
  
  /**
   * Cache expiry time in milliseconds
   */
  cacheExpiry?: number;
  
  /**
   * Whether to return cached data even if it's expired
   * Useful for offline scenarios
   */
  useCachedOnError?: boolean;
}

/**
 * Custom hook that provides access to the API service with authentication and caching
 * Automatically injects the auth token into API requests
 */
export const useApiClient = () => {
  const { getAccessToken, isAuthenticated } = useAuth();

  /**
   * Make an authenticated GET request with caching support
   */
  const get = async <T>(endpoint: string, options?: ApiClientOptions): Promise<T> => {
    const { cache = true, cacheExpiry, useCachedOnError = true, params, ...restOptions } = options || {};
    
    try {
      // Try to get from cache first if caching is enabled
      if (cache) {
        const cachedData = await apiCacheService.get<T>(endpoint, params);
        if (cachedData) {
          return cachedData;
        }
      }
      
      // If not in cache or caching disabled, fetch from API
      const token = isAuthenticated ? await getAccessToken() : undefined;
      const response = await apiService.get<T>(endpoint, { params, ...restOptions }, token || undefined);
      
      // Cache the response if caching is enabled
      if (cache) {
        await apiCacheService.set<T>(endpoint, response, cacheExpiry, params);
      }
      
      return response;
    } catch (error) {
      // On error, try to use cached data even if expired
      if (useCachedOnError && cache) {
        // Force get from cache ignoring expiry
        try {
          const cachedEntry = await apiCacheService.get<T>(endpoint, params);
          if (cachedEntry) {
            console.log('Using cached data due to API error');
            return cachedEntry;
          }
        } catch (cacheError) {
          console.error('Cache fallback failed:', cacheError);
        }
      }
      
      // Re-throw if no cached data available
      throw error;
    }
  };

  /**
   * Make an authenticated POST request
   */
  const post = async <T>(endpoint: string, data?: any, options?: ApiClientOptions): Promise<T> => {
    const token = isAuthenticated ? await getAccessToken() : undefined;
    const response = await apiService.post<T>(endpoint, data, options, token || undefined);
    
    // Invalidate cache for this endpoint on successful POST
    await apiCacheService.delete(endpoint, options?.params);
    
    return response;
  };

  /**
   * Make an authenticated PUT request
   */
  const put = async <T>(endpoint: string, data?: any, options?: ApiClientOptions): Promise<T> => {
    const token = isAuthenticated ? await getAccessToken() : undefined;
    const response = await apiService.put<T>(endpoint, data, options, token || undefined);
    
    // Invalidate cache for this endpoint on successful PUT
    await apiCacheService.delete(endpoint, options?.params);
    
    return response;
  };

  /**
   * Make an authenticated PATCH request
   */
  const patch = async <T>(endpoint: string, data?: any, options?: ApiClientOptions): Promise<T> => {
    const token = isAuthenticated ? await getAccessToken() : undefined;
    const response = await apiService.patch<T>(endpoint, data, options, token || undefined);
    
    // Invalidate cache for this endpoint on successful PATCH
    await apiCacheService.delete(endpoint, options?.params);
    
    return response;
  };

  /**
   * Make an authenticated DELETE request
   */
  const del = async <T>(endpoint: string, options?: ApiClientOptions): Promise<T> => {
    const token = isAuthenticated ? await getAccessToken() : undefined;
    const response = await apiService.delete<T>(endpoint, options, token || undefined);
    
    // Invalidate cache for this endpoint on successful DELETE
    await apiCacheService.delete(endpoint, options?.params);
    
    return response;
  };

  /**
   * Clear all API cache entries
   */
  const clearCache = async (): Promise<void> => {
    await apiCacheService.clear();
  };

  /**
   * Clear only expired cache entries
   */
  const clearExpiredCache = async (): Promise<void> => {
    await apiCacheService.clearExpired();
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    clearCache,
    clearExpiredCache,
  };
};