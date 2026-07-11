import apiClient from './client';

export const authApi = {
  /**
   * Authenticates a user and retrieves access/refresh tokens.
   * @param credentials - The user's login details (e.g., username/email and password).
   * @returns The authentication response data including JWT tokens.
   */
  login: async (credentials: any) => {
    try {
      // Using the SimpleJWT endpoint mapped in Django backend
      const response = await apiClient.post('/api/accounts/token/', credentials);
      
      // Save tokens upon successful authentication
      if (response.data.access && response.data.refresh) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Registers a new user account.
   * @param userData - The required data to create a new user.
   * @returns The registration response data.
   */
  register: async (userData: any) => {
    try {
      const response = await apiClient.post('/api/accounts/register/', userData);
      return response.data;
    } catch (error: any) {
      // Extract clean error messages to return to the UI
      const errorMessage = error.response?.data?.detail 
        || JSON.stringify(error.response?.data) 
        || error.message 
        || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  /**
   * Fetches the profile details of the authenticated user.
   * @returns The user's profile data.
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/accounts/profile/');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  },

  /**
   * Fetches all users for administrative user management.
   */
  getUsers: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/accounts/users/');
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data;
  },

  /**
   * Soft-deletes / deactivates a user.
   */
  deactivateUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/accounts/users/${id}/`);
  },

  /**
   * Logs out the user by clearing local session data and redirecting.
   * Note: This is a local action since JWTs are stateless on the server unless blacklisted.
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth';
  },
};
