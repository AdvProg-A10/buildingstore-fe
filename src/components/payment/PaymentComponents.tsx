import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  BuildingLibraryIcon, 
  DevicePhoneMobileIcon 
} from '@heroicons/react/24/outline';

interface PaymentStatusBadgeProps {
  status: 'LUNAS' | 'CICILAN';
  className?: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    LUNAS: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      icon: CheckCircleIcon,
      label: 'Lunas'
    },
    CICILAN: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      icon: ClockIcon,
      label: 'Cicilan'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      <IconComponent className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

interface PaymentMethodIconProps {
  method: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
  className?: string;
  showLabel?: boolean;
}

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({ 
  method, 
  className = 'h-4 w-4', 
  showLabel = false 
}) => {
  const methodConfig = {
    CASH: { icon: BanknotesIcon, label: 'Cash', color: 'text-green-600' },
    CREDIT_CARD: { icon: CreditCardIcon, label: 'Credit Card', color: 'text-blue-600' },
    BANK_TRANSFER: { icon: BuildingLibraryIcon, label: 'Bank Transfer', color: 'text-purple-600' },
    E_WALLET: { icon: DevicePhoneMobileIcon, label: 'E-Wallet', color: 'text-orange-600' }
  };

  const config = methodConfig[method];
  const IconComponent = config.icon;

  if (showLabel) {
    return (
      <div className="flex items-center">
        <IconComponent className={`${className} ${config.color} mr-2`} />
        <span className="text-sm text-gray-700">{config.label}</span>
      </div>
    );
  }

  return <IconComponent className={`${className} ${config.color}`} />;
};

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  locale?: string;
  currency?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = '', 
  locale = 'id-ID',
  currency = 'IDR'
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <span className={className}>
      {formatCurrency(amount)}
    </span>
  );
};

interface DateDisplayProps {
  date: string;
  className?: string;
  locale?: string;
  format?: 'date' | 'datetime' | 'time';
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ 
  date, 
  className = '', 
  locale = 'id-ID',
  format = 'datetime'
}) => {
  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    
    switch (format) {
      case 'date':
        return dateObj.toLocaleDateString(locale);
      case 'time':
        return dateObj.toLocaleTimeString(locale);
      case 'datetime':
      default:
        return dateObj.toLocaleString(locale);
    }
  };

  return (
    <span className={className}>
      {formatDate(date)}
    </span>
  );
};

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeConfig = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeConfig[size]} ${className}`} />
  );
};

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: IconComponent = ClockIcon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="text-center py-12">
      <IconComponent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
