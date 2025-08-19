import { API_BASE_URL } from './constants';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface TransferRequest {
  recipient: string;
  amount: number;
  token: string;
  memo?: string;
  securityCode: string;
}

export interface TransferResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  recipient: string;
  amount: number;
  token: string;
  memo?: string;
  createdAt: string;
  transactionHash?: string;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
      data: null,
    };
  }
}

// Transfer API functions
export const transferApi = {
  // Create a new transfer
  createTransfer: async (transferData: TransferRequest): Promise<ApiResponse<TransferResponse>> => {
    return apiRequest<TransferResponse>('/transfers', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  },

  // Get user's transfer history
  getUserTransfers: async (page: number = 1, limit: number = 20): Promise<ApiResponse<TransferResponse[]>> => {
    return apiRequest<TransferResponse[]>(`/transfers?page=${page}&limit=${limit}`);
  },

  // Get specific transfer details
  getTransferById: async (id: string): Promise<ApiResponse<TransferResponse>> => {
    return apiRequest<TransferResponse>(`/transfers/${id}`);
  },

  // Get transfer status
  getTransferStatus: async (id: string): Promise<ApiResponse<{ status: string }>> => {
    return apiRequest<{ status: string }>(`/transfers/status/${id}`);
  },
};

// User API functions (if needed)
export const userApi = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/users/profile');
  },

  // Update user profile
  updateProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<ApiResponse<any>> => {
    return apiRequest('/health');
  },
};

export default apiRequest;
