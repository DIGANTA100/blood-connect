/**
 * FIXED OpenAI Service for Browser Environment
 * Uses direct fetch API (no SDK)
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const getHealthAdvice = async (
  prompt: string,
  language: 'en' | 'bn'
): Promise<string> => {

  if (!OPENAI_API_KEY) {
    return language === 'bn'
      ? 'দুঃখিত, OpenAI API কী সেটআপ করা হয়নি। অনুগ্রহ করে .env ফাইলে VITE_OPENAI_API_KEY যোগ করুন।'
      : 'Sorry, OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.';
  }

  const systemInstruction =
    language === 'bn'
      ? 'আপনি একজন বন্ধুত্বপূর্ণ বাংলাদেশি স্বাস্থ্য সহকারী। আপনার কাজ হলো রক্তদান সংক্রান্ত ভুল ধারণা (Myths) ভেঙে দেওয়া এবং স্বাস্থ্য পরামর্শ দেওয়া। বিশেষ করে বাংলাদেশের প্রেক্ষাপটে রক্তদান কেন গুরুত্বপূর্ণ এবং সাধারণ মানুষ যেসব কারণে রক্ত দিতে ভয় পায় সেগুলো সহজভাবে বুঝিয়ে বলুন। উত্তর সবসময় বাংলা ভাষায় দিন। সংক্ষিপ্ত এবং পরিষ্কার উত্তর দিন।'
      : 'You are a friendly Bangladeshi health assistant. Your job is to bust blood donation myths and provide health advice specifically for the context of Bangladesh. Address common fears like weakness, infection, or religious concerns. Keep responses helpful, concise, and under 150 words.';

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini', // cheap + good for testing
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);

      if (response.status === 401) {
        return language === 'bn'
          ? 'API কী সঠিক নয় বা অনুমোদন নেই।'
          : 'Invalid API key or unauthorized access.';
      }

      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }

    throw new Error('Invalid response format from OpenAI API');

  } catch (error) {
    console.error('OpenAI Service Error:', error);

    return language === 'bn'
      ? 'দুঃখিত, বর্তমানে AI সেবা অনুপলব্ধ। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'
      : 'Sorry, AI service is currently unavailable. Please try again later.';
  }
};