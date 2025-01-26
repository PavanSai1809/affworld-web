import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword: React.FC = () => {    
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isPasswordValid = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    if (!isPasswordValid(newPassword)) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('https://affworld-services-1.onrender.com/api/v1/user/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Your password has been updated successfully!');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(data.message || 'Token expired');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Invalid or expired token.');
    }
  }, [token]);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-100"
      style={{
        backgroundImage: "url('https://as2.ftcdn.net/v2/jpg/04/60/71/01/1000_F_460710131_YkD6NsivdyYsHupNvO3Y8MPEwxTAhORh.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-sm w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Reset Password</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full mb-4"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 w-full mb-4"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            <span
              onClick={() => navigate('/login')}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Back to Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
