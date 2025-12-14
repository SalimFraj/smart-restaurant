import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

/**
 * AI-powered chatbot component using Groq's streaming API.
 * Provides menu recommendations, answers customer questions, and assists with reservations.
 * Features real-time streaming responses for a more natural conversation experience.
 */
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I can help you with menu items, recommendations, reservations, and more. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const messageToSend = input.trim();
    const userMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${apiUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: messageToSend })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to get AI response' }));
        throw new Error(errorData.message || 'Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '' };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              }
            } catch (e) {
              // Silently ignore malformed chunks - SSE streams may have incomplete JSON fragments
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to get AI response. Please check if GROQ_API_KEY is configured.';
      toast.error(errorMessage);
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant' && newMessages[newMessages.length - 1].content === '') {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: `Sorry, I encountered an error: ${errorMessage}`
          };
        } else {
          newMessages.push({
            role: 'assistant',
            content: `Sorry, I encountered an error: ${errorMessage}`
          });
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 btn btn-circle btn-primary btn-lg shadow-2xl z-50 hover:scale-110 transition-transform animate-bounce"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <span className="text-2xl">🤖</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100 animate-pulse"></span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-base-100 shadow-2xl rounded-2xl flex flex-col z-50 border border-base-300 overflow-hidden animate-scale-in">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Assistant</h3>
            <p className="text-xs opacity-90">Powered by Groq AI</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-sm btn-circle btn-ghost hover:bg-white/20 transition-all"
          aria-label="Close chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-base-100 to-base-200">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-lg ${msg.role === 'user'
              ? 'bg-primary text-primary-content rounded-br-sm'
              : 'bg-base-200 text-base-content rounded-bl-sm'
              }`}>
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-base-200 rounded-2xl rounded-bl-sm p-3 shadow-lg">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-base-300 bg-base-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything about our menu..."
            className="input input-bordered flex-1 rounded-lg focus:input-primary"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className="btn btn-primary rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-base-content/50 mt-2 text-center">
          💡 Ask about menu items, dietary preferences, or reservations
        </p>
      </div>
    </div>
  );
}

