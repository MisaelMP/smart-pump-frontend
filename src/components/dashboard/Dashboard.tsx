import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  CreditCard,
  LogOut,
  ChevronDown,
  Shield,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth/useAuth';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import type { BalanceInfo, AccountSummary } from '@/types';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import ProfileSection from './ProfileSection';
import BalanceSection from './BalanceSection';
import AccountSummarySection from './AccountSummarySection';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    'profile' | 'balance' | 'summary'
  >('profile');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setIsLoading(true);
    try {
      const [balanceData, summaryData] = await Promise.all([
        apiService.getUserBalance(),
        apiService.getAccountSummary(),
      ]);

      setBalance(balanceData);
      setSummary(summaryData);
    } catch (_error) {
      // Error is handled by toast, no need to log to console in production
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (_error) {
      toast.error('Logout failed');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (!isAuthenticated || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>
            Access Denied
          </h2>
          <p className='text-gray-600'>
            Please log in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo */}
            <div className='flex items-center'>
              <Logo size='sm' />
              <h1 className='text-xl font-bold text-gray-900 ml-3'>
                SMART Pump
              </h1>
            </div>

            {/* User Menu */}
            <div className='relative'>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className='flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none'
              >
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                  <User className='w-4 h-4 text-blue-600' />
                </div>
                <span className='hidden md:block font-medium'>
                  {user.name.first} {user.name.last}
                </span>
                <ChevronDown className='w-4 h-4' />
              </button>

              {showUserMenu && (
                <div className='absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50'>
                  <div className='px-4 py-2 text-sm text-gray-500 border-b'>
                    <div className='truncate' title={user.email}>
                      {user.email}
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setActiveSection('profile')}
                    className='w-full justify-start text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    <User className='w-4 h-4 inline mr-2' />
                    Profile
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setActiveSection('balance')}
                    className='w-full justify-start text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    <CreditCard className='w-4 h-4 inline mr-2' />
                    Balance
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleLogout}
                    className='w-full justify-start text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    <LogOut className='w-4 h-4 inline mr-2' />
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            {getGreeting()}, {user.name.first}!
          </h2>
          <p className='text-gray-600'>
            Welcome to your SMART Pump dashboard. Manage your account and view
            your information.
          </p>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          {/* Account Status */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  user.isActive ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <Shield
                  className={`w-5 h-5 ${
                    user.isActive ? 'text-green-600' : 'text-red-600'
                  }`}
                />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Account Status
                </p>
                <p
                  className={`text-lg font-semibold ${
                    user.isActive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Balance Preview */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <CreditCard className='w-5 h-5 text-blue-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Current Balance
                </p>
                <p className='text-lg font-semibold text-gray-900'>
                  {balance ? balance.balance : user.balance}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Activity className='w-5 h-5 text-purple-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-500'>
                  Profile Complete
                </p>
                <p className='text-lg font-semibold text-gray-900'>
                  {summary ? `${summary.profileCompleteness}%` : '85%'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className='border-b border-gray-200 mb-6'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { key: 'profile', label: 'Profile Information', icon: User },
              { key: 'balance', label: 'Account Balance', icon: CreditCard },
              { key: 'summary', label: 'Account Summary', icon: Activity },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant='ghost'
                size='sm'
                onClick={() =>
                  setActiveSection(key as 'profile' | 'balance' | 'summary')
                }
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className='w-4 h-4 inline mr-2' />
                {label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Dynamic Content */}
        <div className='bg-white rounded-lg shadow'>
          {isLoading ? (
            <div className='p-8 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-2 text-gray-500'>Loading...</p>
            </div>
          ) : (
            <>
              {activeSection === 'profile' && (
                <ProfileSection user={user} onUserUpdate={loadDashboardData} />
              )}
              {activeSection === 'balance' && <BalanceSection />}
              {activeSection === 'summary' && (
                <AccountSummarySection
                  summary={summary}
                  onRefresh={loadDashboardData}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
