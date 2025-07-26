import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface NotFoundProps {
  /**
   * Custom title for the 404 page
   */
  title?: string;
  /**
   * Custom description for the 404 page
   */
  description?: string;
  /**
   * Show the search suggestion
   */
  showSearch?: boolean;
  /**
   * Custom back link URL
   */
  backUrl?: string;
  /**
   * Custom back link text
   */
  backText?: string;
}

/**
 * NotFound Component
 *
 * A comprehensive 404 error page component with customizable content,
 * navigation options, and accessible design following our design system.
 *
 * @param props - Configuration options for the NotFound component
 */
export default function NotFound({
  title = 'Page Not Found',
  description = "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you may have entered the wrong URL.",
  showSearch = true,
  backUrl = '/',
  backText = 'Go Home',
}: NotFoundProps) {
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;

    if (searchQuery?.trim()) {
      // In a real app, this would navigate to search results
      // Development logging only
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('Searching for:', searchQuery);
      }
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 text-center'>
        {/* 404 Large Number */}
        <div className='space-y-4'>
          <div className='text-8xl font-bold text-blue-600 animate-pulse'>
            404
          </div>
          <div className='h-1 w-20 bg-blue-600 mx-auto rounded-full'></div>
        </div>

        {/* Error Content */}
        <div className='space-y-4'>
          <h1 className='text-3xl font-bold text-gray-900'>{title}</h1>
          <p className='text-gray-600 text-balance leading-relaxed'>
            {description}
          </p>
        </div>

        {/* Search Section */}
        {showSearch && (
          <div className='space-y-4'>
            <div className='flex items-center justify-center space-x-2 text-gray-500'>
              <Search className='w-4 h-4' />
              <span className='text-sm'>Try searching instead</span>
            </div>

            <form onSubmit={handleSearchSubmit} className='space-y-3'>
              <Input
                type='text'
                name='search'
                placeholder='Search for what you need...'
                leftIcon={<Search className='w-4 h-4 text-gray-400' />}
                aria-label='Search'
              />
              <Button type='submit' className='w-full'>
                Search
              </Button>
            </form>
          </div>
        )}

        {/* Navigation Actions */}
        <div className='space-y-4'>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <Link
              to={backUrl}
              className='btn-primary inline-flex items-center justify-center'
            >
              <Home className='w-4 h-4 mr-2' />
              {backText}
            </Link>

            <Button
              variant='ghost'
              onClick={() => window.history.back()}
              leftIcon={<ArrowLeft className='w-4 h-4' />}
            >
              Go Back
            </Button>
          </div>

          {/* Help Link */}
          <div className='pt-4 border-t border-gray-200'>
            <Link
              to='/help'
              className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors'
            >
              <HelpCircle className='w-4 h-4 mr-1' />
              Need help? Contact support
            </Link>
          </div>
        </div>

        {/* Decorative Element */}
        <div className='pt-8'>
          <div className='flex justify-center space-x-2'>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s',
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='mt-16 text-center text-xs text-gray-400'>
        <p>© 2025 Smart Pump. All rights reserved.</p>
      </footer>
    </div>
  );
}

export { NotFound };
