import { User } from '../store/useAuthStore';


const API_URL = 'http://localhost:5000'; 

export interface AuthResponse {
    token: string;
    user: User;
}


export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
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
    const response = await fetch(`${API_URL}/signup`, {
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
