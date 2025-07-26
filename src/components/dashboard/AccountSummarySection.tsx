import React from 'react';
import {
  User,
  Mail,
  Building,
  Shield,
  Activity,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import type { AccountSummary } from '@/types';
import Button from '@/components/ui/Button';

interface AccountSummarySectionProps {
  summary: AccountSummary | null;
  onRefresh: () => void;
}

const AccountSummarySection: React.FC<AccountSummarySectionProps> = ({
  summary,
  onRefresh,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!summary) {
    return (
      <div className='p-6'>
        <div className='text-center py-8'>
          <Activity className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Account Summary
          </h3>
          <p className='text-gray-500 mb-4'>
            Unable to load account summary information
          </p>
          <Button onClick={onRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>Account Summary</h3>
          <p className='text-sm text-gray-500'>
            Overview of your account information and status
          </p>
        </div>
        <Button variant='secondary' onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
        {/* Account Status */}
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='font-medium text-gray-900'>Account Status</h4>
            <Shield
              className={`w-5 h-5 ${
                summary.accountStatus === 'Active'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            />
          </div>
          <p
            className={`text-lg font-semibold ${
              summary.accountStatus === 'Active'
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {summary.accountStatus}
          </p>
        </div>

        {/* Profile Completeness */}
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='font-medium text-gray-900'>Profile Complete</h4>
            <Activity className='w-5 h-5 text-blue-600' />
          </div>
          <div className='flex items-center'>
            <p className='text-lg font-semibold text-gray-900'>
              {summary.profileCompleteness}%
            </p>
            <div className='ml-2 flex-1 bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-600 h-2 rounded-full'
                style={{ width: `${summary.profileCompleteness}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Security Level */}
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='font-medium text-gray-900'>Security Level</h4>
            <CheckCircle className='w-5 h-5 text-green-600' />
          </div>
          <p className='text-lg font-semibold text-gray-900'>
            {summary.securityLevel}
          </p>
        </div>
      </div>

      {/* Detailed Information */}
      <div className='bg-white border rounded-lg p-6'>
        <h4 className='text-md font-medium text-gray-900 mb-4'>
          Account Details
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Left Column */}
          <div className='space-y-4'>
            <div className='flex items-center'>
              <User className='w-4 h-4 text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Display Name</p>
                <p className='font-medium text-gray-900'>
                  {summary.displayName}
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <Mail className='w-4 h-4 text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Email Address</p>
                <p className='font-medium text-gray-900'>{summary.email}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <Building className='w-4 h-4 text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Company</p>
                <p className='font-medium text-gray-900'>{summary.company}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-4'>
            <div className='flex items-center'>
              <span className='w-4 h-4 text-gray-400 mr-3 font-mono text-xs'>
                ID
              </span>
              <div>
                <p className='text-sm text-gray-500'>Account ID</p>
                <p className='font-mono text-sm text-gray-900'>
                  {summary.accountId}
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <Activity className='w-4 h-4 text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Current Balance</p>
                <p className='font-medium text-gray-900'>{summary.balance}</p>
              </div>
            </div>
            <div className='flex items-center'>
              <Calendar className='w-4 h-4 text-gray-400 mr-3' />
              <div>
                <p className='text-sm text-gray-500'>Last Activity</p>
                <p className='font-medium text-gray-900'>
                  {formatDate(summary.lastActivity)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className='mt-6 bg-gray-50 border rounded-lg p-4'>
        <div className='flex items-start'>
          <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5'>
            <Activity className='w-4 h-4 text-blue-600' />
          </div>
          <div className='flex-1'>
            <h5 className='text-sm font-medium text-gray-900 mb-1'>
              Account Management
            </h5>
            <p className='text-sm text-gray-600 mb-3'>
              Manage your account settings, update your profile information, or
              contact support for assistance.
            </p>
            <div className='flex space-x-3'>
              <Button size='sm' variant='secondary'>
                Account Settings
              </Button>
              <Button size='sm' variant='ghost'>
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummarySection;
