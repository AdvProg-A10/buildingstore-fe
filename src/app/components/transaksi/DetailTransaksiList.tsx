// src/app/components/transaksi/DetailTransaksiList.tsx
'use client';

import { DetailTransaksi } from '@/app/lib/api/transaksi';

interface DetailTransaksiListProps {
  transaksiId: number;
  details: DetailTransaksi[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  canEdit: boolean;
}

export default function DetailTransaksiList({ 
  transaksiId, 
  details, 
  loading, 
  error, 
  onRefetch, 
  canEdit 
}: DetailTransaksiListProps) {
  const formatCurrency = (amount: number) => {
    return new Int