import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/authentication/signup';
import Login from './components/authentication/login';
import ForgotPassword from './components/authentication/forgotpassword';
import ResetPassword from './components/authentication/resetpassword';
import Dashboard from './components/dashboard';
import Home from './components/home';
import { AuthProvider } from './components/contexts/AuthContext';
import MyProfile from './components/profile-management/myprofile';
import EditProfile from './components/profile-management/Profile';
import PrivateRoute from './components/authentication/privateroute'; // Import PrivateRoute
import PostList from './components/blog-management/PostList'; // Import PostList component
import PostForm from './components/blog-management/PostForm'; // Import PostForm component
import PostDetail from './components/blog-management/PostDetail'; // Import PostDetail component
// import CommentForm from './components/blog-management/CommentForm';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Post Management Routes */}
        <Route path="/posts" element={<PostList />} />
        <Route path="/posts/new" element={<PrivateRoute><PostForm /></PrivateRoute>} />
        <Route path="/posts/edit/:id" element={<PrivateRoute><PostForm /></PrivateRoute>} />
        <Route path="/posts/:id" element={<PostDetail />} />
        {/* <Route path="/posts/:id/comments" element={<CommentForm />} /> */}
        
        {/* Profile Management Routes */}
        <Route path="/my-profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
        <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        
        {/* Dashboard Route */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
        {/* Redirect from root to login or dashboard if needed */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
