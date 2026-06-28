import React, { useEffect, useRef, useState } from 'react';
import Orb from './Orb.jsx';
import { Card } from './cards.jsx';
import { createConversation, sendMessage, fixMojibake } from './api.js';
import { configFor } from './orbStates.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SUGGESTIONS = [
  'Can I afford a ₹20 lakh car in 3 years?',
  'Do I have idle cash to invest?',
  'Help me save tax under 80C',
  "What's my ideal asset allocation?",
  'Why is investing early better than waiting?',
];

export default function App() {
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm WealthOrb, your AI wealth advisor. Ask me about a goal, idle cash, allocation, or tax — every number I give is computed by our engine, never made up.", card: null },
  ]);
  const [orbState, setOrbState] = useState('idle');
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const amplitude = useRef(0); // 0..1 drives the speaking pulse
  const ampTimer = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    createConversation().then((r) => setConvId(r.conversationId)).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' });
  }, [messages]);

  function startAmplitude() {
    stopAmplitude();
    ampTimer.current = setInterval(() => {
      // Pseudo speech envelope: bursts + decay.
      const target = 0.3 + Math.random() * 0.7;
      amplitude.current = amplitude.current * 0.5 + target * 0.5;
    }, 90);
  }
  function stopAmplitude() {
    if (ampTimer.current) clearInterval(ampTimer.current);
    ampTimer.current = null;
    amplitude.current = 0;
  }

  async function replay(events) {
    // Build one assistant message progressively as events arrive.
    let msgIndex;
    setMessages((m) => {
      msgIndex = m.length;
      return [...m, { role: 'assistant', text: '', card: null }];
    });

    let celebrate = false;
    for (const ev of events) {
      if (ev.type === 'avatar_state') {
        if (ev.state === 'speaking') startAmplitude();
        setOrbState(ev.state);
        await sleep(ev.state === 'listening' ? 450 : ev.state === 'thinking' ? 850 : 120);
      } else if (ev.type === 'token') {
        const piece = fixMojibake(ev.text);
        setMessages((m) => {
          const copy = [...m];
          copy[msgIndex] = { ...copy[msgIndex], text: copy[msgIndex].text + piece };
          return copy;
        });
        await sleep(28);
      } else if (ev.type === 'card') {
        if (ev.card?.kind === 'goal' && ev.card.data?.onTrack) celebrate = true;
        setMessages((m) => {
          const copy = [...m];
          copy[msgIndex] = { ...copy[msgIndex], card: ev.card };
          return copy;
        });
        await sleep(150);
      } else if (ev.type === 'done') {
        stopAmplitude();
      }
    }
    if (celebrate) {
      setOrbState('celebrate');
      await sleep(1600);
    }
    setOrbState('idle');
  }

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy || !convId) return;
    setInput('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', text: q, card: null }]);
    setOrbState('listening');
    try {
      const { events } = await sendMessage(convId, q);
      await replay(events);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: '⚠️ Could not reach the advisor service. Is the orchestrator running on :8005?', card: null }]);
      setOrbState('alert');
      await sleep(1200);
      setOrbState('idle');
    } finally {
      setBusy(false);
      stopAmplitude();
    }
  }

  const cfg = configFor(orbState);

  return (
    <div className="app">
      <aside className="stage">
        <div className="brand">
          <div className="brand-mark">◐</div>
          <div>
            <div className="brand-name">WealthOrb</div>
            <div className="brand-sub">AI Wealth Advisor · for every IDBI customer</div>
          </div>
        </div>

        <div className="orb-wrap">
          <Orb state={orbState} amplitude={amplitude} />
          <div className="state-pill" style={{ borderColor: cfg.color, color: cfg.color }}>
            <i style={{ background: cfg.color }} /> {cfg.label}
          </div>
        </div>

        <div className="trust">
          <b>Why it's safe to ship:</b> every figure comes from a deterministic computation
          engine and is suitability-checked — the AI phrases numbers, it never invents them.
        </div>
      </aside>

      <main className="chat">
        <div className="messages" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`row ${m.role}`}>
              <div className={`bubble ${m.role}`}>
                {m.text && <p>{m.text}</p>}
                {m.card && <Card card={m.card} />}
              </div>
            </div>
          ))}
          {busy && orbState !== 'speaking' && (
            <div className="row assistant"><div className="bubble assistant typing"><span/><span/><span/></div></div>
          )}
        </div>

        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" disabled={busy} onClick={() => send(s)}>{s}</button>
          ))}
        </div>

        <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a goal, idle cash, allocation, or tax…"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()}>Send</button>
        </form>
      </main>
    </div>
  );
}
