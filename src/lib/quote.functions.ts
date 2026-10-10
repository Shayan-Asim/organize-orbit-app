import { createServerFn } from '@tanstack/react-start';

// Fetches a fresh motivational study quote from OpenRouter.
// Runs server-side only so the API key never reaches the browser.
export const getAIQuote = createServerFn({ method: 'GET' }).handler(async () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { quote: null };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',
        max_tokens: 60,
        messages: [
          {
            role: 'user',
            content:
              'Give me one short, original motivational quote for a student planning their study day. One sentence only, no attribution, no quotation marks.',
          },
        ],
      }),
    });

    if (!response.ok) return { quote: null };
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text || text.length > 200) return { quote: null };
    return { quote: text };
  } catch {
    return { quote: null };
  }
});
