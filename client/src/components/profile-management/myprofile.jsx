import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, Edit3 } from 'lucide-react';
import Sidebar from '../sidebar';
import Modal from './Model'; // Ensure this path is correct
import EditProfile from './Profile'; // Ensure this path is correct

const API_URL = 'http://localhost:5000/api/users';

const MyProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    profilePhoto: ''
  });
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedDOB = response.data.dob
          ? new Date(response.data.dob).toISOString().split('T')[0]
          : '';

        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          dob: formattedDOB,
          address: response.data.address || '',
          profilePhoto: response.data.profilePhoto || '',
        });

        if (response.data.profilePhoto) {
          const url = getPhotoUrl(response.data.profilePhoto);
          setPhotoUrl(url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        setMessage('Failed to fetch profile data');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `http://localhost:5000/api/uploads/${photoPath.split('\\').pop()}`;
  };

  const handleEditProfile = () => {
    setIsModalOpen(true); // Open modal
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex justify-between items-center rounded-t-lg">
            <h2 className="text-3xl font-bold text-white">My Profile</h2>
            <button
              onClick={handleEditProfile}
              className="text-white bg-transparent hover:bg-indigo-700 p-2 rounded-full transition duration-200"
              aria-label="Edit Profile"
            >
              <Edit3 className="w-6 h-6" />
            </button>
          </div>
          {message && (
            <p className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
              {message}
            </p>
          )}
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white bg-gray-200 flex items-center justify-center">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                ) : (
                  <User className="w-24 h-24 text-gray-500" />
                )}
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-gray-600 mt-1 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-500" />
                  {formData.email}
                </p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                icon={<Phone className="w-5 h-5 text-blue-500" />}
                label="Phone"
                value={formData.phone}
              />
              <InfoItem
                icon={<Calendar className="w-5 h-5 text-blue-500" />}
                label="Date of Birth"
                value={
                  formData.dob
                    ? new Date(formData.dob).toLocaleDateString()
                    : 'Not provided'
                }
              />
              <InfoItem
                icon={<MapPin className="w-5 h-5 text-blue-500" />}
                label="Address"
                value={formData.address || 'Not provided'}
                className="md:col-span-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Edit Profile */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <EditProfile closeModal={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

const InfoItem = ({ icon, label, value, className = '' }) => (
  <div className={`flex items-start space-x-3 ${className}`}>
    {icon}
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-900">{value}</p>
    </div>
  </div>
);

export default MyProfile;
