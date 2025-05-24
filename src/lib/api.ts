import { config } from '@/config';

interface FetchOptions extends RequestInit {
    path: string;
}

export async function apiClient({ path, ...options }: FetchOptions): Promise<Response> {
    const url = `${config.apiBaseUrl}${path}`;
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...options.headers,
        },
    });

    return response;
}
