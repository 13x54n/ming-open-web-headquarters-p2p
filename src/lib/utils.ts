import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Backend API configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Utility function to send user data to backend
export async function sendUserToBackend(uid: string, email: string | null) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        email,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('User data sent to backend successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send user data to backend:', error);
    // Don't throw error here to avoid breaking the sign-in flow
    // The user can still use the app even if backend sync fails
    return null;
  }
}
