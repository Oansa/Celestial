import React from 'react';
import { authenticate, getPrincipal, II_URL } from '../services/icAuth';

const InternetIdentityButton = ({ 
  onSuccess, 
  onError, 
  buttonText = "Connect Internet Identity",
  className = "internet-identity-button",
  environment = "local"
}) => {
  
  const handleAuthentication = async () => {
    try {
      const identityProvider = II_URL[environment] || II_URL.local;
      const identity = await authenticate(identityProvider);
      const principal = await getPrincipal();
      
      if (onSuccess) {
        onSuccess({ identity, principal });
      }
    } catch (error) {
      console.error('Internet Identity authentication failed:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <button 
      className={className}
      onClick={handleAuthentication}
      type="button"
    >
      {buttonText}
    </button>
  );
};

export default InternetIdentityButton;
