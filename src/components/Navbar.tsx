import Link from 'next/link';
import { checkAuth } from '@/lib/auth';
import { LogoutButton } from '@/components/LogoutButton';

export default async function Navbar() {
    const user = await checkAuth();
    const isAuthenticated = user !== null;

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center flex-shrink-0">
                        <Link 
                            href="/" 
                            className="flex items-center space-x-2"
                        >
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                BuildingStore
                            </span>
                            <span className="text-sm font-semibold text-gray-600 border border-gray-300 rounded px-2 py-1">
                                POS
                            </span>
                        </Link>
                    </div>

                    {isAuthenticated && (
                        <div className="flex items-center space-x-4">
                            <LogoutButton />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
