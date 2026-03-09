import { useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { API_BASE_URL } from '../config/api';

const normalizeBulletPoints = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).replace(/^[-*\s]+/, '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split('\n')
    .map((line) => line.replace(/^[-*\s]+/, '').trim())
    .filter(Boolean);
};

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: [
      'I can explain vulnerabilities in bullet points.',
      'Ask about risk, examples, or remediation steps.',
    ],
  },
];

function SecurityChat({ isDark = true }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = input.trim();
    if (!message || loading) {
      return;
    }

    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/chat`,{ message });
      const points = normalizeBulletPoints(response.data?.response).slice(0, 8);
      setMessages((current) => [...current, { role: 'assistant', content: points }]);
    } catch (chatError) {
      const messageText =
        chatError.response?.data?.message || 'AI chat is unavailable. Verify local Ollama is running.';
      setError(messageText);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: ['I could not answer right now.', 'Ensure Ollama and the mistral model are running.'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResultCard title="Security Assistant" subtitle="Ask AI security questions" isDark={isDark}>
      <div className="space-y-3">
        <div
          className={`max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3 ${
            isDark ? 'border-slate-700 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-cyan-400 text-slate-950'
                      : isDark
                      ? 'border border-cyan-500 bg-black font-mono text-green-400'
                      : 'bg-white text-slate-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ul className="list-disc space-y-1 pl-5">
                      {normalizeBulletPoints(message.content).map((point, pointIndex) => (
                        <li key={`${point}-${pointIndex}`}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{String(message.content)}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error ? (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              isDark
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="How dangerous is missing CSP?"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
              isDark
                ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
                : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-600'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <LoadingSpinner size="h-4 w-4" className="border-slate-900/40 border-t-slate-900" />
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </ResultCard>
  );
}

export default SecurityChat;



