const API_BASE_URL = 'http://127.0.0.1:5001';

export const analyzeImage = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const runMainScript = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/run-main`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[API] run-main response:', data);
    return data;
  } catch (error) {
    console.error('[API] runMainScript failed:', error);
    throw error;
  }
};

export const sendChatMessage = async (message, imageData = null, useVoice = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        image: imageData,
        use_voice: useVoice
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Chat API call failed:', error);
    throw error;
  }
};

// Create apiService object for EnergyDocComposer
export const apiService = {
  sendEnergyMessage: async ({ text, inputMode, language }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/energy-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          inputMode,
          language
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Energy message API call failed:', error);
      throw error;
    }
  },
  
  // Add other API methods as needed
  analyzeImage,
  runMainScript,
  sendChatMessage
};
