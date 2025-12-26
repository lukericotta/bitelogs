import { Link } from 'react-router-dom';
import { useAuth } from '../../context';

export const Header = () => {
  // FIX: Only destructure what we need - removed unused 'user' variable
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="font-display text-xl font-bold text-primary-600">
              BiteLogs
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/restaurants"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Restaurants
            </Link>
            <Link
              to="/discover"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Discover
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {user.displayName}
                </Link>
                <button
                  onClick={logout}
                  className="btn-outline text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
