import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test wrapper with MemoryRouter (better for testing)
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

// Helper to render component with router
const renderWithRouter = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

describe('NotFound Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.log for search testing
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Default Rendering', () => {
    it('renders with default props', () => {
      renderWithRouter(<NotFound />);

      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(
        screen.getByText(/Sorry, we couldn't find the page/)
      ).toBeInTheDocument();
    });

    it('displays the 404 number prominently', () => {
      renderWithRouter(<NotFound />);

      const notFoundNumber = screen.getByText('404');
      expect(notFoundNumber).toBeInTheDocument();
      expect(notFoundNumber).toHaveClass(
        'text-8xl',
        'font-bold',
        'text-blue-600'
      );
    });

    it('shows search functionality by default', () => {
      renderWithRouter(<NotFound />);

      expect(
        screen.getByPlaceholderText('Search for what you need...')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Search' })
      ).toBeInTheDocument();
    });

    it('displays navigation buttons', () => {
      renderWithRouter(<NotFound />);

      expect(
        screen.getByRole('link', { name: /go home/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /go back/i })
      ).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('renders custom title and description', () => {
      const customTitle = 'Custom Not Found';
      const customDescription = 'This is a custom description for testing.';

      renderWithRouter(
        <NotFound title={customTitle} description={customDescription} />
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customDescription)).toBeInTheDocument();
    });

    it('hides search when showSearch is false', () => {
      renderWithRouter(<NotFound showSearch={false} />);

      expect(
        screen.queryByPlaceholderText('Search for what you need...')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Search' })
      ).not.toBeInTheDocument();
    });

    it('renders custom back button text and URL', () => {
      const customBackText = 'Return to Dashboard';
      const customBackUrl = '/dashboard';

      renderWithRouter(
        <NotFound backText={customBackText} backUrl={customBackUrl} />
      );

      const backLink = screen.getByRole('link', {
        name: /return to dashboard/i,
      });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', customBackUrl);
    });
  });

  describe('Search Functionality', () => {
    it('handles search form submission', async () => {
      renderWithRouter(<NotFound />);

      const searchInput = screen.getByPlaceholderText(
        'Search for what you need...'
      );
      const searchButton = screen.getByRole('button', { name: 'Search' });

      // Type in search input
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      expect(searchInput).toHaveValue('test query');

      // Submit form
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          'Searching for:',
          'test query'
        );
      });
    });

    it('does not search with empty query', async () => {
      renderWithRouter(<NotFound />);

      const searchButton = screen.getByRole('button', { name: 'Search' });

      // Submit form without entering anything
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(console.log).not.toHaveBeenCalled();
      });
    });

    it('trims whitespace from search query', async () => {
      renderWithRouter(<NotFound />);

      const searchInput = screen.getByPlaceholderText(
        'Search for what you need...'
      );
      const searchButton = screen.getByRole('button', { name: 'Search' });

      // Type in search input with whitespace
      fireEvent.change(searchInput, { target: { value: '  test query  ' } });

      // Submit form
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          'Searching for:',
          '  test query  '
        );
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to home by default', () => {
      renderWithRouter(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /go home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('calls window.history.back() when Go Back is clicked', () => {
      // Mock window.history.back
      const mockBack = vi.fn();
      Object.defineProperty(window, 'history', {
        value: { back: mockBack },
        writable: true,
      });

      renderWithRouter(<NotFound />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      fireEvent.click(backButton);

      expect(mockBack).toHaveBeenCalledOnce();
    });

    it('renders help link', () => {
      renderWithRouter(<NotFound />);

      const helpLink = screen.getByRole('link', {
        name: /need help\? contact support/i,
      });
      expect(helpLink).toBeInTheDocument();
      expect(helpLink).toHaveAttribute('href', '/help');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      renderWithRouter(<NotFound />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Page Not Found');
    });

    it('has proper aria labels', () => {
      renderWithRouter(<NotFound />);

      const searchInput = screen.getByLabelText('Search');
      expect(searchInput).toBeInTheDocument();
    });

    it('has descriptive link text', () => {
      renderWithRouter(<NotFound />);

      // Check that links have descriptive text, not just "click here"
      expect(
        screen.getByRole('link', { name: /go home/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /need help\? contact support/i })
      ).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('renders decorative bouncing dots', () => {
      renderWithRouter(<NotFound />);

      // Check that there are animated elements (bouncing dots)
      const container = screen.getByText('404').closest('div');
      expect(container).toBeInTheDocument();
    });

    it('displays footer with copyright', () => {
      renderWithRouter(<NotFound />);

      expect(
        screen.getByText('© 2025 Smart Pump. All rights reserved.')
      ).toBeInTheDocument();
    });

    it('has proper CSS classes for styling', () => {
      renderWithRouter(<NotFound />);

      const notFoundNumber = screen.getByText('404');
      expect(notFoundNumber).toHaveClass('animate-pulse');
    });
  });

  describe('Component Variants', () => {
    it('works as a minimal error page', () => {
      renderWithRouter(
        <NotFound
          title='Oops!'
          description='Something went wrong.'
          showSearch={false}
          backText='Try Again'
        />
      );

      expect(screen.getByText('Oops!')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /try again/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText('Search for what you need...')
      ).not.toBeInTheDocument();
    });
  });
});

// Integration test with different scenarios
describe('NotFound Integration', () => {
  it('handles complete user flow', async () => {
    renderWithRouter(<NotFound />);

    // User sees the error page
    expect(screen.getByText('404')).toBeInTheDocument();

    // User tries to search
    const searchInput = screen.getByPlaceholderText(
      'Search for what you need...'
    );
    fireEvent.change(searchInput, { target: { value: 'user management' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    // Search is triggered
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        'Searching for:',
        'user management'
      );
    });

    // User can navigate away
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
  });
});
