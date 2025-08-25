import React, { useState } from 'react';
import InternetIdentityButton from './InternetIdentityButton';

const InternetIdentityButtonUsage = () => {
  const [userPrincipal, setUserPrincipal] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = ({ identity, principal }) => {
    console.log('Authentication successful:', { identity, principal });
    setUserPrincipal(principal);
    setIsAuthenticated(true);
  };

  const handleAuthError = (error) => {
    console.error('Authentication failed:', error);
    alert('Failed to authenticate with Internet Identity. Please try again.');
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Internet Identity Authentication</h2>
      
      {!isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your Internet Identity to continue:
          </p>
          
          {/* Replace any file upload field with this button */}
          <InternetIdentityButton
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
            buttonText="Connect Internet Identity"
            className="internet-identity-button"
            environment="ic" // or "local" or "playground"
          />
          
          {/* Alternative styling examples */}
          <div className="space-y-2">
            <InternetIdentityButton
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
              buttonText="Sign in with II"
              className="internet-identity-button small"
              environment="ic"
            />
            
            <InternetIdentityButton
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
              buttonText="Authenticate with Internet Identity"
              className="internet-identity-button large"
              environment="ic"
            />
          </div>
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Successfully Authenticated!
          </h3>
          <p className="text-sm text-green-700 mb-2">Your Principal ID:</p>
          <p className="text-xs font-mono bg-green-100 p-2 rounded break-all">
            {userPrincipal}
          </p>
        </div>
      )}
    </div>
  );
};

export default InternetIdentityButtonUsage;
