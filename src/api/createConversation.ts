import { TAVUS_API_KEY } from '@/config';
import { IConversation } from '@/types';

export const createConversation = async (): Promise<IConversation> => {
  try {
    console.log('Creating conversation with API key:', TAVUS_API_KEY ? 'Present' : 'Missing');
    
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY,
      },
      body: JSON.stringify({
        persona_id: 'p794081bc1df', // Stock Demo Persona
        conversation_name: 'Interactive Learning Session',
        properties: {
          max_call_duration: 3600,
          participant_left_timeout: 60,
          participant_absent_timeout: 300,
          enable_recording: false,
          enable_transcription: true,
        }
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Conversation created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};