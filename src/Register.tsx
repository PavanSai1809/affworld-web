import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ name: string; email: string; password: string }>({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    const errors: { name: string; email: string; password: string } = { name: '', email: '', password: '' };
    if (!name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (!password.trim()) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.values(errors).every((error) => error === '');
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:4002/api/v1/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setFormErrors((prev) => ({ ...prev, email: data.message || 'Email is already registered' }));
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
        backgroundImage: 'url("https://as2.ftcdn.net/v2/jpg/04/60/71/01/1000_F_460710131_YkD6NsivdyYsHupNvO3Y8MPEwxTAhORh.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-sm w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Register</h1>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 w-full mb-4"
        />
        {formErrors.name && <p className="text-red-600 text-sm">{formErrors.name}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 w-full mb-4"
        />
        {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 w-full mb-4"
        />
        {formErrors.password && <p className="text-red-600 text-sm">{formErrors.password}</p>}

        {successMessage && <p className="text-green-600 text-sm mb-4">{successMessage}</p>}

        <button
          onClick={handleRegister}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
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

export default Register;
