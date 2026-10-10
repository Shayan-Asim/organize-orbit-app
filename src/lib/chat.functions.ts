import { createServerFn } from '@tanstack/react-start';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT =
  'You are a friendly study assistant inside a Study Planner app. Help students plan study sessions, break down topics, stay motivated, and answer study-related questions. Keep answers concise, warm and practical. Use short paragraphs or bullet points.';

// Sends the full conversation to OpenRouter and returns the assistant reply.
// Runs server-side only so the API key never reaches the browser.
export const sendChatMessage = createServerFn({ method: 'POST' })
  .inputValidator((input: { messages: ChatMessage[] }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env['OPENROUTER_API_KEY'];
    if (!apiKey) return { reply: null, error: 'The AI assistant is not configured yet.' };

    const messages = data.messages
      .filter((m) => typeof m.content === 'string' && m.content.trim())
      .slice(-20);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct',
          max_tokens: 500,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        }),
      });

      if (!response.ok) {
        return { reply: null, error: 'The assistant is busy right now. Please try again in a moment.' };
      }
      const json = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = json.choices?.[0]?.message?.content?.trim();
      if (!reply) return { reply: null, error: 'The assistant returned an empty reply. Please try again.' };
      return { reply, error: null };
    } catch {
      return { reply: null, error: 'Could not reach the assistant. Check your connection and try again.' };
    }
  });
