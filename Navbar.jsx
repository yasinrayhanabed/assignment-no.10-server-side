import { Link } from 'react-router-dom';
import { FiHome, FiBook, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <FiBook className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">LearnHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <FiHome className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/courses"
              className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <FiBook className="w-4 h-4" />
              <span>Courses</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <FiUser className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiHome className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/courses"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiBook className="w-4 h-4" />
                <span>Courses</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;