import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import PostList from './blog-management/PostList';
import PostForm from './blog-management/PostForm';
import Modal from './Model';
import axios from 'axios';

import { ChartBarIcon, EyeIcon, ChatBubbleLeftRightIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalPosts: 0, totalViews: 0, totalComments: 0 });
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);


  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized');
        setLoading(false);
        return;
      }

      try {
        const [userResponse, statsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/posts/stats', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setUser(userResponse.data);
        setStats(statsResponse.data);
      } catch (err) {
        setError('Access denied: ' + (err.response ? err.response.data.msg : err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreatePost = () => {
    setIsPostFormOpen(true);
  };

  const handleClosePostForm = () => {
    setIsPostFormOpen(false);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar handleLogout={handleLogout} user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <p className="text-gray-600">Welcome, <span className="font-semibold">{user.firstName} {user.lastName}</span></p>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: 'Total Posts', value: stats.totalPosts, icon: ChartBarIcon, color: 'bg-blue-500' },
                  { title: 'Total Views', value: stats.totalViews, icon: EyeIcon, color: 'bg-green-500' },
                  { title: 'Total Comments', value: stats.totalComments, icon: ChatBubbleLeftRightIcon, color: 'bg-yellow-500' },
                ].map((item, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${item.color} rounded-md p-3`}>
                          <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dt className="text-sm font-medium text-gray-500 truncate">{item.title}</dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Posts</h2>
                <button 
                  onClick={handleCreatePost}
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <PencilSquareIcon className="h-5 w-5 mr-2" />
                  Create New Post
                </button>
              </div>

              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <PostList />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      
      {isPostFormOpen && (
        <Modal onClose={handleClosePostForm}>
          <PostForm onClose={handleClosePostForm} />
        </Modal>
      )}
    </div>
  );
}


export default Dashboard;