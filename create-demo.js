async function createDemo() {
  try {
    const response = await fetch('https://reminiscent-wildebeest-246.convex.cloud/api/demo/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'AI Demo Bot', 
        description: 'Intelligent AI assistant for testing real responses' 
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (text) {
      try {
        const data = JSON.parse(text);
        console.log('Demo chatbot created:', data);
        
        if (data.chatbotId) {
          console.log('\nUse this chatbot ID for testing:', data.chatbotId);
          console.log('Embed code:', data.embedCode);
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
    }
  } catch (error) {
    console.error('Error creating demo:', error);
  }
}

createDemo(); 