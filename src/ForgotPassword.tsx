import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ email: string }>({ email: '' });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    const errors: { email: string } = { email: '' };
    if (!email.trim()) errors.email = 'Email is required';
    setFormErrors(errors);
    return Object.values(errors).every((error) => error === '');
  };

  const handleReset = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setSuccessMessage('');

    try {
      const origin = window.location.origin;
      const response = await fetch('https://affworld-services-1.onrender.com/api/v1/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, origin }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Password reset link sent to your email.');
      } else {
        setFormErrors((prev) => ({ ...prev, email: data.message || 'Invalid email address' }));
      }
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, email: 'Something went wrong. Please try again later.' }));
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Forgot Password</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 w-full mb-4"
        />
        {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}

        {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}

        <button
          onClick={handleReset}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <div className="mt-4 text-center">
          <p>
            <span
              onClick={() => navigate('/')}
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

export default ForgotPassword;
