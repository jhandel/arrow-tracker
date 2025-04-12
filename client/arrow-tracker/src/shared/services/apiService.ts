/**
 * Base API URL from environment variables
 */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.arrowtracker.com';

/**
 * HTTP methods supported by the API service
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API service options
 */
export interface ApiOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  withCredentials?: boolean;
  timeout?: number;
}

/**
 * API request configuration
 */
interface RequestConfig extends RequestInit {
  timeout?: number;
  params?: Record<string, string>;
}

/**
 * API error response structure
 */
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

/**
 * API service for communicating with backend services
 */
class ApiService {
  /**
   * Get the authorization header with a token
   */
  private async getAuthHeader(token?: string): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  /**
   * Execute an HTTP request with timeout
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options: ApiOptions = {},
    token?: string
  ): Promise<T> {
    const headers = await this.getAuthHeader(token);
    const url = this.buildUrl(endpoint, options.params);
    
    // Merge custom headers with default headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.append(key, value);
      });
    }
    
    const config: RequestConfig = {
      method,
      headers,
      credentials: options.withCredentials ? 'include' : 'same-origin',
      timeout: options.timeout,
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data) {
      config.body = JSON.stringify(data);
    }
    
    try {
      // Create a timeout promise if timeout is specified
      const timeoutPromise = options.timeout
        ? new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), options.timeout)
          )
        : null;
      
      // Execute the fetch request
      const fetchPromise = fetch(url, config);
      
      // Race between fetch and timeout if timeout is specified
      const response = await (timeoutPromise
        ? Promise.race([fetchPromise, timeoutPromise])
        : fetchPromise);
      
      // Check if response is ok (status in the range 200-299)
      if (!response.ok) {
        let errorData: any = { message: response.statusText };
        
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore JSON parsing errors
        }
        
        const error: ApiError = {
          status: response.status,
          message: errorData.message || 'An error occurred',
          details: errorData.details,
        };
        
        throw error;
      }
      
      // Check if response is empty
      if (response.status === 204) {
        return {} as T;
      }
      
      // Parse response as JSON
      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      
      throw {
        status: 0,
        message: (error as Error).message || 'Network error',
      } as ApiError;
    }
  }

  /**
   * Perform a GET request
   */
  public async get<T>(endpoint: string, options?: ApiOptions, token?: string): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options, token);
  }

  /**
   * Perform a POST request
   */
  public async post<T>(endpoint: string, data?: any, options?: ApiOptions, token?: string): Promise<T> {
    return this.request<T>('POST', endpoint, data, options, token);
  }

  /**
   * Perform a PUT request
   */
  public async put<T>(endpoint: string, data?: any, options?: ApiOptions, token?: string): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options, token);
  }

  /**
   * Perform a PATCH request
   */
  public async patch<T>(endpoint: string, data?: any, options?: ApiOptions, token?: string): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options, token);
  }

  /**
   * Perform a DELETE request
   */
  public async delete<T>(endpoint: string, options?: ApiOptions, token?: string): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options, token);
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService;