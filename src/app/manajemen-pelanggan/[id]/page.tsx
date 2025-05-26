// manajemen-pelanggan/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { config } from '@/config';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FaArrowLeft } from 'react-icons/fa';

interface Customer {
    id: number;
    nama: string;
    no_telp: string;
    alamat: string;
    tanggal_gabung: string;
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchCustomerDetails = async () => {
            const { id } = await params;
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/pelanggan/${id}`, {
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Failed to fetch customer details');
                const data = await response.json();
                setCustomer(data);
            } catch (error) {
                console.error('Error fetching customer details:', error);
                router.push('/manajemen-pelanggan');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerDetails();
    }, [params, router]);

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!customer) {
        return <div className="text-center py-8 text-red-600">Customer not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">            <button
                onClick={() => router.push('/manajemen-pelanggan')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
                <FaArrowLeft /> Kembali
            </button>

            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Detail Pelanggan</h1>
                
                <div className="space-y-4">
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">ID Pelanggan</h2>
                        <p className="mt-1 text-lg text-gray-900">{customer.id}</p>
                    </div>
                    
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Nama</h2>
                        <p className="mt-1 text-lg text-gray-900">{customer.nama}</p>
                    </div>
                    
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Nomor Telepon</h2>
                        <p className="mt-1 text-lg text-gray-900">{customer.no_telp}</p>
                    </div>
                    
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Alamat</h2>
                        <p className="mt-1 text-lg text-gray-900">{customer.alamat}</p>
                    </div>
                    
                    <div>
                        <h2 className="text-sm font-medium text-gray-500">Tanggal Bergabung</h2>
                        <p className="mt-1 text-lg text-gray-900">
                            {format(new Date(customer.tanggal_gabung), 'dd MMMM yyyy')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
