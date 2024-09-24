import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Tooltip from '@mui/material/Tooltip';

const API_URL = 'http://localhost:5000/api/users';
const IMAGE_BASE_URL = 'http://localhost:5000/api/uploads/';

const Sidebar = ({ initialUser = {} }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [profile, setProfile] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const fetchedRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (Object.keys(initialUser).length === 0 && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchProfile();
    }
  }, [fetchProfile, initialUser]);

  const photoUrl = profile.profilePhoto
    ? `${IMAGE_BASE_URL}${profile.profilePhoto}`
    : 'https://via.placeholder.com/150?text=No+Image';
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';

  const sidebarLinks = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/my-profile', icon: UserIcon, label: 'My Profile' },
    { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
  ];

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gradient-to-b from-blue-800 to-blue-600 text-white h-screen transition-all duration-300 ease-in-out shadow-xl flex flex-col justify-between`}
    >
      {/* Toggle Button */}
      <div>
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:bg-blue-700 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
          >
            {isOpen ? (
              <ChevronLeftIcon className="w-6 h-6" />
            ) : (
              <ChevronRightIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <Tooltip title={isOpen ? '' : label} placement="right" arrow key={to}>
              <Link
                to={to}
                className={`flex items-center space-x-4 px-6 py-3 mb-2 transition-colors duration-300 ${
                  location.pathname === to
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6" />
                {isOpen && <span className="text-sm font-medium">{label}</span>}
              </Link>
            </Tooltip>
          ))}
        </nav>
      </div>

      {/* User Profile Section at the Bottom */}
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={() => navigate('/my-profile')}
          className="relative group"
          disabled={isLoading}
        >
          <img
            src={photoUrl}
            alt="Profile"
            className={`w-14 h-14 rounded-full border-4 border-blue-400 object-cover shadow-lg transition-transform duration-300 transform group-hover:scale-105 ${
              isLoading ? 'opacity-50' : ''
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150?text=No+Image';
            }}
          />
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
        </button>
        {isOpen && (
          <span className="text-sm font-semibold text-gray-300 mt-2 truncate max-w-[160px]">
            {isLoading ? 'Loading...' : fullName}
          </span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
