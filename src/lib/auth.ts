import { cookies } from 'next/headers';
import { config } from '@/config';

interface AuthResponse {
    user_id: number;
    username: string;
    is_admin: boolean;
}

export async function checkAuth(): Promise<AuthResponse | null> {
    const cookieStore = cookies();
    const cookieHeader = (await cookieStore).toString();
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/auth/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookieHeader,
            },
            credentials: 'include',
        });
        if (response.ok) {
            const data: AuthResponse = await response.json();
            return data;
        } else {
            return null;
        }
    } catch {
        return null;
    }
}
