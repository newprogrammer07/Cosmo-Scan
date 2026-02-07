import { User } from '../store/useAuthStore';
// IMPORT THE CONFIG VARIABLE
import { API_BASE_URL } from '../config'; 

export interface AuthResponse {
    token: string;
    user: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    // FIX: Use API_BASE_URL instead of hardcoded localhost
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    return data;
};

export const signup = async (name: string, email: string, password: string): Promise<{ success: boolean }> => {
    // FIX: Use API_BASE_URL instead of hardcoded localhost
    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
    }

    return { success: true };
};