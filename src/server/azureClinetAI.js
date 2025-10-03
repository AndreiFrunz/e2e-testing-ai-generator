import axios from 'axios';

export async function askAzureAI(messages) {
  try {
    const response = await axios.post(
      `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
      {
        messages, // [{ role: "user", content: "Hello AI" }]
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_KEY,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error('Azure AI API Error:', err.response?.data || err.message);
    throw new Error('Failed to call Azure AI');
  }
}
