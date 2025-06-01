'use client';

import { ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ValidationDisplayProps {
  errors: string[];
  warnings: string[];
  className?: string;
}

export default function ValidationDisplay({ errors, warnings, className = '' }: ValidationDisplayProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors.length === 1 ? 'Error ditemukan:' : `${errors.length} error ditemukan:`}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {warnings.length === 1 ? 'Perhatian:' : `${warnings.length} hal yang perlu diperhatikan:`}
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc space-y-1 pl-5">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface InstallmentSummaryProps {
  totalPaid: number;
  remaining: number;
  percentagePaid: number;
  installmentCount: number;
  averageInstallment: number;
}

export function InstallmentSummaryCard({ 
  totalPaid, 
  remaining, 
  percentagePaid, 
  installmentCount, 
  averageInstallment 
}: InstallmentSummaryProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
        </div>
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-blue-800 mb-3">
            Analisis Cicilan
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Total Cicilan:</span>
              <div className="text-blue-800">{installmentCount} pembayaran</div>
            </div>
            
            <div>
              <span className="text-blue-600 font-medium">Rata-rata Cicilan:</span>
              <div className="text-blue-800">{formatCurrency(averageInstallment)}</div>
            </div>
            
            <div>
              <span className="text-blue-600 font-medium">Sudah Dibayar:</span>
              <div className="text-blue-800">{formatCurrency(totalPaid)}</div>
            </div>
            
            <div>
              <span className="text-blue-600 font-medium">Sisa:</span>
              <div className="text-blue-800">{formatCurrency(remaining)}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-blue-600 mb-1">
              <span>Progress Pembayaran</span>
              <span>{percentagePaid.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(percentagePaid, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
