import React from 'react';
import {
  CreditCard,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBalance, useRefreshBalance } from '@/hooks/useBalance';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const BalanceSection: React.FC = () => {
  const { data: balance, isLoading, error } = useBalance();
  const refreshMutation = useRefreshBalance();

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync();
      toast.success('Balance refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh balance');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='text-center py-8'>
          <LoadingSpinner size='lg' />
          <p className='text-gray-500 mt-4'>Loading balance information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='p-6'>
        <div className='text-center py-8'>
          <CreditCard className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Error Loading Balance
          </h3>
          <p className='text-gray-500 mb-4'>
            {error instanceof Error
              ? error.message
              : 'Unable to load balance information'}
          </p>
          <Button
            onClick={handleRefresh}
            leftIcon={<RefreshCw className='w-4 h-4' />}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? 'Refreshing...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className='p-6'>
        <div className='text-center py-8'>
          <CreditCard className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Balance Information
          </h3>
          <p className='text-gray-500 mb-4'>
            Unable to load balance information
          </p>
          <Button
            onClick={handleRefresh}
            leftIcon={<RefreshCw className='w-4 h-4' />}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? 'Refreshing...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>Account Balance</h3>
          <p className='text-sm text-gray-500'>
            Your current account balance and transaction information
          </p>
        </div>
        <Button
          variant='secondary'
          leftIcon={<RefreshCw className='w-4 h-4' />}
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
        >
          {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Balance Card */}
      <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6'>
        <div className='flex justify-between items-start'>
          <div>
            <p className='text-blue-100 text-sm font-medium mb-1'>
              Current Balance
            </p>
            <h2 className='text-3xl font-bold mb-2'>{balance.balance}</h2>
            <p className='text-blue-100 text-sm'>
              {formatCurrency(balance.numericBalance)} {balance.currency}
            </p>
          </div>
          <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center'>
            <DollarSign className='w-6 h-6' />
          </div>
        </div>
        <div className='mt-4 pt-4 border-t border-blue-500'>
          <div className='flex items-center text-blue-100 text-sm'>
            <Calendar className='w-4 h-4 mr-2' />
            Last updated: {formatDate(balance.lastUpdated)}
          </div>
        </div>
      </div>

      {/* Balance Details */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
        {/* Numeric Balance */}
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Numeric Value</p>
              <p className='text-2xl font-bold text-gray-900'>
                {balance.numericBalance.toLocaleString()}
              </p>
            </div>
            <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
              <TrendingUp className='w-5 h-5 text-green-600' />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Currency</p>
              <p className='text-2xl font-bold text-gray-900'>
                {balance.currency}
              </p>
            </div>
            <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
              <DollarSign className='w-5 h-5 text-blue-600' />
            </div>
          </div>
        </div>

        {/* Account Type */}
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Account Type</p>
              <p className='text-2xl font-bold text-gray-900'>Standard</p>
            </div>
            <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
              <CreditCard className='w-5 h-5 text-purple-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Balance History */}
      <div className='bg-gray-50 rounded-lg p-6'>
        <h4 className='text-md font-medium text-gray-900 mb-4'>
          Balance Information
        </h4>
        <div className='space-y-3'>
          <div className='flex justify-between items-center py-2'>
            <span className='text-sm text-gray-600'>Account Balance</span>
            <span className='text-sm font-medium text-gray-900'>
              {balance.balance}
            </span>
          </div>
          <div className='flex justify-between items-center py-2'>
            <span className='text-sm text-gray-600'>Formatted Amount</span>
            <span className='text-sm font-medium text-gray-900'>
              {formatCurrency(balance.numericBalance)}
            </span>
          </div>
          <div className='flex justify-between items-center py-2'>
            <span className='text-sm text-gray-600'>Currency Code</span>
            <span className='text-sm font-medium text-gray-900'>
              {balance.currency}
            </span>
          </div>
          <div className='flex justify-between items-center py-2'>
            <span className='text-sm text-gray-600'>Last Update</span>
            <span className='text-sm font-medium text-gray-900'>
              {formatDate(balance.lastUpdated)}
            </span>
          </div>
        </div>
      </div>

      {/* Balance Actions */}
      <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex items-start'>
          <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5'>
            <CreditCard className='w-4 h-4 text-blue-600' />
          </div>
          <div className='flex-1'>
            <h5 className='text-sm font-medium text-blue-900 mb-1'>
              Balance Management
            </h5>
            <p className='text-sm text-blue-700 mb-3'>
              Your account balance is managed automatically. For any
              discrepancies or questions about your balance, please contact our
              support team.
            </p>
            <div className='flex space-x-3'>
              <Button size='sm' variant='secondary'>
                Contact Support
              </Button>
              <Button size='sm' variant='ghost'>
                View History
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSection;
