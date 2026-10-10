import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Sprout, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendChatMessage, type ChatMessage } from '@/lib/chat.functions';

const STORAGE_KEY = 'study-planner-chat-v1';

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm your study assistant. Ask me anything — help planning your study session, breaking down a tough topic, or staying motivated. How can I help today?",
};

// AI study assistant chat. Conversation persists in localStorage like the tasks.
export function StudyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore the saved conversation on first load (browser-only, so in an effect).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(saved) && saved.length && saved.every((m) => typeof m.content === 'string')) {
          setMessages(saved);
        }
      }
    } catch {
      // Corrupt storage: keep the welcome message.
    }
    inputRef.current?.focus();
  }, []);

  // Persist every change and scroll to the newest message.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full: chat still works for this session.
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const result = await sendChatMessage({ data: { messages: next } });
      if (result.reply) {
        setMessages([...next, { role: 'assistant', content: result.reply }]);
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not reach the assistant. Please try again.');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function clearChat() {
    setMessages([WELCOME]);
    setError('');
    inputRef.current?.focus();
  }

  return (
    <section className="surface chat-panel" aria-label="AI study assistant">
      <div className="chat-header">
        <div className="chat-identity">
          <span className="chat-avatar"><Sprout size={18} /></span>
          <div>
            <strong>Study Assistant</strong>
            <span>Powered by AI · always here to help</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Clear conversation" title="Clear conversation" onClick={clearChat}>
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="chat-bubble assistant typing">
            <LoaderCircle className="animate-spin" size={16} /> Thinking…
          </div>
        )}
        {error && <div className="chat-error">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask your study assistant…"
          aria-label="Message the study assistant"
          rows={1}
        />
        <Button type="submit" size="icon" aria-label="Send message" disabled={busy || !input.trim()}>
          <Send size={17} />
        </Button>
      </form>
    </section>
  );
}
