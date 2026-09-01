import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api, ApiError } from "../services/api";

export default function ChatAssistant({ reportId = null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [size, setSize] = useState({ width: 420, height: 560 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (!isResizing || !resizeStart.current) return undefined;
    const handlePointerMove = (event) => {
      const start = resizeStart.current;
      const maxWidth = window.innerWidth - 32;
      const maxHeight = window.innerHeight - 110;
      const minWidth = Math.min(300, maxWidth);
      const minHeight = Math.min(360, maxHeight);
      setSize({
        width: Math.min(maxWidth, Math.max(minWidth, start.width + start.x - event.clientX)),
        height: Math.min(maxHeight, Math.max(minHeight, start.height + start.y - event.clientY)),
      });
    };
    const stopResize = () => {
      resizeStart.current = null;
      setIsResizing(false);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };
  }, [isResizing]);

  const handleResizeStart = (event) => {
    event.preventDefault();
    resizeStart.current = { x: event.clientX, y: event.clientY, ...size };
    setIsResizing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question || loading) return;
    setMessage("");
    setError("");
    setMessages((current) => [...current, { role: "user", text: question }]);
    setLoading(true);
    try {
      const response = await api.chat(question, reportId);
      const assistantMessages = response.message
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 3)
        .map((text) => ({ role: "assistant", text }));
      setMessages((current) => [...current, ...assistantMessages]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The assistant could not answer right now.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/10 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}
      {open && <section style={{ width: `${size.width}px`, height: `${size.height}px` }} className="fixed bottom-20 right-4 z-50 flex min-h-0 max-h-[calc(100vh-110px)] min-w-0 max-w-[calc(100vw-32px)] flex-col overflow-auto rounded-card border border-border bg-white p-5 shadow-2xl sm:right-6 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-forest-light text-forest">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5a3.5 3.5 0 0 1-3.5 3.5H12l-4.5 4v-4.3A3.5 3.5 0 0 1 5 11.5z" /><path d="M9 8h6M9 11h4" /></svg>
        </div>
        <div><p className="text-label font-semibold uppercase tracking-[0.16em] text-forest">Veris assistant</p><h2 className="mt-1 font-display text-h2 text-ink">Ask about {reportId ? "this report" : "your reports"}</h2><p className="mt-1 text-body-sm text-muted">Answers are grounded in the report context available to Veris.</p></div>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-ink" aria-label="Close chat"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto border-t border-border pt-4">{messages.length === 0 ? <p className="rounded-btn bg-page p-3 text-body-sm text-muted">Ask a specific question about a result, range, or pattern.</p> : <div className="space-y-3">{messages.map((item, index) => <div key={`${item.role}-${index}`} className={item.role === "user" ? "ml-8 rounded-btn bg-page p-3 text-body-sm text-ink" : "mr-8 rounded-btn bg-forest-light p-3 text-body-sm leading-relaxed text-ink"}><p className="mb-1 text-label font-semibold uppercase tracking-wide text-muted">{item.role === "user" ? "You" : "Veris"}</p>{item.text}</div>)}</div>}</div>
      {error && <p className="mt-4 text-body-sm text-critical" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-5 flex items-end gap-2 border-t border-border pt-4">
        <label className="sr-only" htmlFor={`chat-message-${reportId || "all"}`}>Ask Veris</label>
        <textarea id={`chat-message-${reportId || "all"}`} rows="2" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={reportId ? "Ask about a result, range, or explanation" : "Ask about patterns across your reports"} className="min-h-[52px] min-w-0 flex-1 resize-none rounded-btn border border-border bg-page px-3 py-2.5 text-body-sm text-ink focus:border-forest focus:outline-none" />
        <button type="submit" disabled={!message.trim() || loading} className="flex h-[52px] shrink-0 items-center justify-center rounded-btn bg-forest px-4 text-body-sm font-medium text-white hover:bg-[#255840] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Thinking..." : "Ask"}</button>
      </form>
      <button type="button" onPointerDown={handleResizeStart} className="absolute left-1 top-1 h-5 w-5 cursor-nwse-resize touch-none" aria-label="Resize chat window"><svg className="absolute left-0 top-0 h-4 w-4 rotate-180 text-faint" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 15 15 5M9 15l6-6" stroke="currentColor" strokeWidth="1.4" /></svg></button>
      </section>}
      <button type="button" onClick={() => setOpen((current) => !current)} className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-3 rounded-pill bg-forest px-5 text-body-sm font-semibold text-white shadow-lg hover:bg-[#255840]" aria-expanded={open} aria-label={open ? "Close Veris assistant" : "Open Veris assistant"}>
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5a3.5 3.5 0 0 1-3.5 3.5H12l-4.5 4v-4.3A3.5 3.5 0 0 1 5 11.5z" /><path d="M9 8h6M9 11h4" /></svg>
        <span>{open ? "Close" : "Ask Veris"}</span>
      </button>
    </>,
    document.body
  );
}