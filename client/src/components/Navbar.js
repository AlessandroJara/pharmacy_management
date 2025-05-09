import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const role = localStorage.getItem('role') || '';
  const username = localStorage.getItem('username') || 'admin'; // Assuming username is stored during login
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username'); // Clear username if stored
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-blue-600 p-4 shadow-lg"> {/* Changed to bg-blue-600 for consistency */}
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        {/* Brand/Logo */}
        <div className="text-white text-2xl font-extrabold tracking-tight">
          <Link to="/" className="hover:text-blue-200 transition-colors duration-300">
            Nova Salud Pharmacy
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center space-x-6 mt-2 md:mt-0">
          <Link
            to="/"
            className="text-white text-lg font-medium hover:bg-blue-700 hover:text-white px-4 py-2 rounded-lg transition-all duration-300"
          >
            Dashboard
          </Link>
          <Link
            to="/inventory"
            className="text-white text-lg font-medium hover:bg-blue-700 hover:text-white px-4 py-2 rounded-lg transition-all duration-300"
          >
            Inventario
          </Link>
          <Link
            to="/sales"
            className="text-white text-lg font-medium hover:bg-blue-700 hover:text-white px-4 py-2 rounded-lg transition-all duration-300"
          >
            Ventas
          </Link>
          {role === 'admin' && (
            <Link
              to="/users"
              className="text-white text-lg font-medium hover:bg-blue-700 hover:text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
              Usuarios
            </Link>
          )}

          {/* Profile Icon with Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 focus:outline-none"
            >
              {/* Placeholder for a user icon (e.g., a letter or SVG) */}
              <span className="text-lg font-semibold">{username.charAt(0).toUpperCase()}</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                {/* Username */}
                <div className="px-4 py-2 text-gray-800 text-sm font-medium">
                  {username}
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;