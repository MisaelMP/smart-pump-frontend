# SMART Pump Frontend

A modern React application for the SMART Pump User Management System, built with TypeScript, Vite, and TanStack Query.

## Features

- Modern Authentication Flow - JWT-based authentication with refresh tokens
- State Management - TanStack Query for server state, Zustand for client state
- Type Safety - Full TypeScript support with strict type checking
- Responsive Design - Mobile-first design with Tailwind CSS
- Real-time Updates - Automatic data synchronization and caching
- Security - CSRF protection, secure HTTP-only cookies, and XSS prevention
- Testing - Comprehensive test suite with Vitest and Testing Library

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Strict type checking and modern JavaScript features
- **Vite** - Fast development server and optimized builds
- **TanStack Query** - Powerful data synchronization for React
- **Zustand** - Simple, scalable state management
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Declarative routing for React
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Sonner** - Beautiful toast notifications
- **Vitest** - Fast unit testing framework
- **ESLint** - Code linting with strict rules

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on port 3001

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

- `VITE_API_URL`: Backend API endpoint (default: http://localhost:3001/api)
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version
- `VITE_DEV_TOOLS`: Enable development tools (true/false)

4. Start development server:

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Development

The application will be available at `http://localhost:5173`.

### Building

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript compiler check
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── dashboard/      # Dashboard components
│   └── ui/             # UI components
├── hooks/              # Custom React hooks
├── services/           # API services
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── test/               # Test utilities
└── assets/             # Static assets
```

## State Management Architecture

### Server State (TanStack Query)

- API data fetching and caching
- Background updates and synchronization
- Error handling and retry logic
- Optimistic updates

### Client State (Zustand)

- User authentication state
- UI preferences and settings
- Form state management
- Navigation state

## Authentication Flow

1. **Login** - User submits credentials
2. **CSRF Token** - Automatically fetched and included in requests
3. **JWT Tokens** - Access token (15min) and refresh token (7 days)
4. **Auto Refresh** - Transparent token renewal
5. **Logout** - Clean session termination

## Security Features

- CSRF Protection - Anti-CSRF tokens on state-changing requests
- HTTP-Only Cookies - Secure token storage
- Automatic Logout - Session timeout handling
- XSS Prevention - Content Security Policy headers
- Input Validation - Client and server-side validation

## Environment Variables

| Variable       | Description     | Default                     |
| -------------- | --------------- | --------------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the SMART Pump system demonstration.
