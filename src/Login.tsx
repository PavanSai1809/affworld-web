import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email: string; password: string }>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    const errors: { email: string; password: string } = { email: '', password: '' };
    if (!email.trim()) errors.email = 'Email is required';
    if (!password.trim()) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.values(errors).every((error) => error === '');
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:4002/api/v1/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { result } = data;

        localStorage.setItem('authToken', result);

        onLoginSuccess();
      } else {
        setErrorMessage(data.message || 'Invalid email or password');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again later.');
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
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Login</h1>
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

        {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="mt-4 text-center">
          <p>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
          <p>
            <span
              onClick={() => navigate('/forgot-password')}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
