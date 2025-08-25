// This is an example component showing how to use InternetIdentityAuth
// You can use this as a reference or delete it after integration

import React from 'react';
import InternetIdentityAuth from './InternetIdentityAuth';

const InternetIdentityAuthUsageExample = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Internet Identity Integration Example
        </h1>
        
        {/* This is how you would use the component */}
        <InternetIdentityAuth />
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Integration Notes:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Import: import InternetIdentityAuth from './components/InternetIdentityAuth'</li>
            <li>• Usage: <InternetIdentityAuth /></li>
            <li>• After login, it navigates to /signup with principal in state</li>
            <li>• Uses React Router for navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InternetIdentityAuthUsageExample;
