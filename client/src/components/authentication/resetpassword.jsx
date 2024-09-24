import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, { password });
      alert(response.data.msg);
    } catch (err) {
      alert('Error: ' + err.response.data.msg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your new password"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
}

export default ResetPassword;
