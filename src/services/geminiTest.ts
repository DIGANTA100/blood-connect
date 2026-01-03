const GEMINI_API_KEY = 'AIzaSyDGMMDsoMDLxFmuUrIzoAE5lqqkZ_r8iuQ';

export const testGemini = async (): Promise<string> => {
  console.log('🚀 Testing Gemini with model: gemini-2.0-flash-lite-001');
  
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite-001:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say hello in one sentence' }]
        }]
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Full response:', data);

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    return 'No text in response';
  } catch (error) {
    console.error('Test failed:', error);
    return 'Error occurred';
  }
};