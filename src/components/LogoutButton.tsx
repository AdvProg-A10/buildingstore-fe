'use client';

import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import { apiClient } from '@/lib/api';

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await apiClient({
                path: '/api/auth/logout',
                method: 'GET',
            });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 border-transparent hover:border-red-200"
        >
            <FaSignOutAlt className="text-base" />
            <span>Keluar</span>
        </button>
    );
}
