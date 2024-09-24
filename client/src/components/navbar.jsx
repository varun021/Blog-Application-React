import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-blue-600 text-xl font-bold hover:text-blue-500 transition duration-300">
          MyApp
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <Link to="/login" className="text-blue-600 text-sm font-medium hover:text-blue-500 py-1 px-3 rounded-lg transition-colors duration-300">
            Login
          </Link>
          <Link to="/signup" className="text-blue-600 text-sm font-medium hover:text-blue-500 py-1 px-3 rounded-lg transition-colors duration-300 border border-blue-600 hover:bg-blue-100">
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-blue-600 focus:outline-none">
            {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-blue-50 py-4`}>
        <Link to="/login" className="block text-blue-600 text-sm font-medium py-2 px-4 hover:bg-blue-100 rounded-lg transition-colors duration-300" onClick={() => setIsOpen(false)}>
          Login
        </Link>
        <Link to="/signup" className="block text-blue-600 text-sm font-medium py-2 px-4 hover:bg-blue-100 rounded-lg transition-colors duration-300" onClick={() => setIsOpen(false)}>
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
