import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import { Alert, AlertDescription, Button, Input, Textarea, Label, Card, CardHeader, CardTitle, CardContent } from '../ui/uis';
import { Toaster, toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const EditProfile = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    profilePhoto: null,
  });
  const [message, setMessage] = useState('');
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const formattedDOB = response.data.dob
        ? new Date(response.data.dob).toISOString().split('T')[0]
        : '';

      setFormData((prevState) => ({
        ...prevState,
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        dob: formattedDOB,
        address: response.data.address || '',
      }));

      if (response.data.profilePhoto) {
        setProfilePhotoPreview(`${API_URL}/uploads/${response.data.profilePhoto}`);
      }
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      setMessage('Failed to fetch profile data');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prevState) => ({
        ...prevState,
        profilePhoto: files[0],
      }));
      setProfilePhotoPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      await axios.put(`${API_URL}/users/profile`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Profile updated successfully');
      closeModal();
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      setMessage('Failed to update profile');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <Label htmlFor="profilePhoto" className="mb-2 cursor-pointer">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaCamera className="text-4xl text-gray-400" />
                )}
              </div>
            </Label>
            <Input
              type="file"
              id="profilePhoto"
              name="profilePhoto"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <span className="text-sm text-gray-500 mt-2">Click to change profile photo</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="flex items-center">
                <FaUser className="mr-2" />
                First Name
              </Label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="flex items-center">
                <FaUser className="mr-2" />
                Last Name
              </Label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center">
              <FaEnvelope className="mr-2" />
              Email
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="flex items-center">
              <FaPhone className="mr-2" />
              Phone
            </Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dob" className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              Date of Birth
            </Label>
            <Input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address" className="flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              Address
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
      <Toaster />
    </Card>
  );
};

export default EditProfile;