import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Backend API configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Type definitions
interface OrdersResponse {
  success: boolean;
  data: {
    orders: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isActive?: boolean;
  totalOrders?: number;
}

// Utility function to send user data to backend
export async function sendUserToBackend(uid: string, email: string | null, displayName?: string | null, photoURL?: string | null) {
  try {
    const userData = {
      uid,
      email,
      displayName,
      photoURL,
    };

    const response = await fetch(`${BACKEND_URL}/api/users/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {

    // Don't throw error here to avoid breaking the sign-in flow
    // The user can still use the app even if backend sync fails
    return null;
  }
}

// Utility function to logout user from backend
export async function logoutFromBackend(uid: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(`Backend logout error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // Don't throw error here to avoid breaking the logout flow
    // The user can still logout from Firebase even if backend fails
    return null;
  }
}

// Utility function to create orders
export async function createOrder(orderData: {
  uid?: string;
  type: 'buy' | 'sell';
  cryptocurrency: string;
  amount: number;
  price: number;
  paymentMethods: string[];
  additionalInfo?: string;
}) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Check if it's a network error (backend not available)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to backend server. Please check if the server is running on port 4000.');
    }

    throw error;
  }
}

// Utility function to fetch user data from backend
export async function fetchUserData(uid: string): Promise<UserData | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/uid/${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success) {
        return {
          uid: data.data.uid,
          email: data.data.email,
          displayName: data.data.displayName || `User ${uid.slice(-4)}`,
          photoURL: data.data.photoURL || null,
          isActive: data.data.isActive !== false, // Default to true if not specified
          totalOrders: data.data.totalOrders || 0,
        };
      }
    }

    // Fallback: return basic info
    return {
      uid,
      email: null,
      displayName: `User ${uid.slice(-4)}`,
      photoURL: null,
      isActive: true, // Default to active for fallback
      totalOrders: 0,
    };
  } catch (error) {
    // Return fallback data if backend is not available
    return {
      uid,
      email: null,
      displayName: `User ${uid.slice(-4)}`,
      photoURL: null,
      isActive: true, // Default to active for fallback
      totalOrders: 0,
    };
  }
}

// Utility function to fetch orders from backend
export async function fetchOrders(params: {
  page?: number;
  limit?: number;
  type?: 'buy' | 'sell';
  status?: string;
  cryptocurrency?: string;
  sort?: string;
}): Promise<OrdersResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.type) searchParams.append('type', params.type);
    if (params.status) searchParams.append('status', params.status);
    if (params.cryptocurrency) searchParams.append('cryptocurrency', params.cryptocurrency);
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await fetch(`${BACKEND_URL}/api/orders?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Check if it's a network error (backend not available)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to backend server. Please check if the server is running on port 4000.');
    }

    throw error;
  }
}

// Utility function to shorten wallet addresses
export function shortenAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

