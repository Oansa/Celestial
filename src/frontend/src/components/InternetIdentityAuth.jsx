import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticate, getPrincipal, logout, II_URL } from '../services/icAuth';

const InternetIdentityAuth = () => {
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentPrincipal = await getPrincipal();
        if (currentPrincipal) {
          setPrincipal(currentPrincipal);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await authenticate(II_URL.ic);
      const userPrincipal = await getPrincipal();
      setPrincipal(userPrincipal);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to authenticate with Internet Identity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setPrincipal(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleContinueToSignup = () => {
    navigate('/signup', { state: { principal } });
  };

  if (principal) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome!
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Principal ID:</p>
            <p className="text-xs font-mono text-gray-800 break-all bg-gray-100 p-2 rounded">
              {principal}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleContinueToSignup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Continue to Signup
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Internet Identity Login
        </h2>
        <p className="text-gray-600 mb-6">
          Sign in securely with Internet Identity to access your account
        </p>
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Authenticating...' : 'Login with Internet Identity'}
        </button>
        {loading && (
          <p className="text-sm text-gray-500 mt-2">
            Please complete the authentication in the popup window...
          </p>
        )}
      </div>
    </div>
  );
};

export default InternetIdentityAuth;
