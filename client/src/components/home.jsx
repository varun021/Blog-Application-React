import React from 'react';
import Navbar from './navbar';

const Home = () => {
  return (
   
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
       <Navbar/>
      <h1 className="text-5xl font-bold mb-6">Welcome to MyApp</h1>
      <p className="text-lg mb-6">A simple authentication system built with React and MongoDB.</p>
      <a href="/login" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500">
        Get Started
      </a>
    </div>
  );
};

export default Home;
