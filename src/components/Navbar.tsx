import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, User, Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, profile, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      setIsOpen(false);
      navigate('/login');
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Ticket className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">AfriTix</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-gray-600 hover:text-indigo-600">
              Events
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-indigo-600">
              Categories
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 focus:outline-none"
                >
                  <User className="h-5 w-5" />
                  <span>{profile?.name || 'Account'}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/support"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Support
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
              >
                <User className="h-5 w-5" />
                <span>Sign in</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden rounded-lg p-2 hover:bg-gray-100 focus:outline-none"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              to="/events"
              className="block text-gray-600 hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/categories"
              className="block text-gray-600 hover:text-indigo-600"
              onClick={() => setIsOpen(false)}
            >
              Categories
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-600 hover:text-indigo-600"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block text-gray-600 hover:text-indigo-600"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/support"
                  className="block text-gray-600 hover:text-indigo-600"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Support
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:text-red-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-gray-600 hover:text-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}