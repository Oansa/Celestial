// Simple test to verify backend/frontend integration
// Run this in browser console or as a separate test

const testRunMain = async () => {
  try {
    console.log('Testing /run-main endpoint...');
    
    const response = await fetch('http://127.0.0.1:5001/run-main', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Success! Speech output:', data.stdout);
      return data.stdout;
    } else {
      console.error('❌ Error:', data.stderr || data.error);
      return data.stderr || data.error;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return error.message;
  }
};

// Test the integration
console.log('=== Integration Test ===');
testRunMain().then(output => {
  console.log('Final output to display:', output);
});
