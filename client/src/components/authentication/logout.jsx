const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
  
    // Optionally, you can also clear the entire localStorage if needed
    localStorage.clear();
  
    // Redirect to the login page or home page
    window.location.href = '/login'; // You can redirect to another route if needed
  };
  