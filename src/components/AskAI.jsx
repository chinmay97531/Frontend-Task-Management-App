import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config.js";
import { useToast } from "./Toast.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

const TIP_KEY = "taskiii-tip-dismissed";

const FIELD_LABELS = {
  title: "Title",
  description: "Description",
  label: "Label",
  dueDate: "Due date",
  status: "Status",
  assignedTo: "Assignee",
  important: "Important",
};

const WELCOME =
  "Hi, I'm Taskiii. Describe a task in plain English — I'll draft it and ask for anything missing. You can say “fill the rest yourself” and I'll complete remaining fields, or ask to show previous chats.";

function formatDraftValue(key, draft) {
  if (!draft) return "—";
  if (key === "assignedTo") {
    const list = draft.assignedTo || [];
    if (list.length === 0) return "—";
    return list.map((a) => `${a.name} <${a.email}>`).join(", ");
  }
  if (key === "important") return draft.important ? "Yes" : "No";
  return draft[key] || "—";
}

function isHistoryRequest(text) {
  const t = text.toLowerCase();
  return (
    /\b(previous|past|old|earlier)\b.*\b(chat|conversation|history|message)/.test(
      t
    ) ||
    /\b(chat|conversation|message).*\b(history|previous|past)\b/.test(t) ||
    /\b(show|open|see|view|list)\b.*\b(history|chats|conversations)\b/.test(
      t
    ) ||
    /^(history|my chats|previous chats|past chats)$/.test(t.trim())
  );
}

function TaskiiiMark({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.8c.55 2.45 2.25 4.15 4.7 4.7-2.45.55-4.15 2.25-4.7 4.7-.55-2.45-2.25-4.15-4.7-4.7 2.45-.55 4.15-2.25 4.7-4.7Z"
        fill="currentColor"
      />
      <path
        d="M18.2 14.4c.32 1.35 1.25 2.28 2.6 2.6-1.35.32-2.28 1.25-2.6 2.6-.32-1.35-1.25-2.28-2.6-2.6 1.35-.32 2.28-1.25 2.6-2.6Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M6.4 15.2c.22.95.85 1.58 1.8 1.8-.95.22-1.58.85-1.8 1.8-.22-.95-.85-1.58-1.8-1.8.95-.22 1.58-.85 1.8-1.8Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

function formatChatTime(value) {
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function AskAI({ refreshTasks }) {
  const toast = useToast();
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("chat"); // chat | draft | history
  const [showTip, setShowTip] = useState(() => {
    try {
      return localStorage.getItem(TIP_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: WELCOME },
  ]);
  const [conversationId, setConversationId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [readyToCreate, setReadyToCreate] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const dismissTip = () => {
    setShowTip(false);
    try {
      localStorage.setItem(TIP_KEY, "1");
    } catch {
      // ignore
    }
  };

  const loadHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoryLoading(true);
    try {
      const response = await axios.get(BACKEND_URL + "/ai/history", {
        headers: { token },
      });
      setHistory(response.data.chats || []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not load chat history."));
    } finally {
      setHistoryLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !sending && !creating) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, sending, creating]);

  useEffect(() => {
    if (open && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open, view]);

  useEffect(() => {
    if (listRef.current && view === "chat") {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, sending, open, view]);

  const openHistory = async () => {
    setView("history");
    await loadHistory();
  };

  const startFreshChat = async () => {
    const token = localStorage.getItem("token");
    if (conversationId && token) {
      try {
        await axios.post(
          BACKEND_URL + "/ai/task-reset",
          { conversationId },
          { headers: { token } }
        );
      } catch {
        // ignore
      }
    }
    setConversationId(null);
    setDraft(null);
    setMissingFields([]);
    setReadyToCreate(false);
    setInput("");
    setMessages([{ role: "assistant", content: WELCOME }]);
    setView("chat");
  };

  const openPastChat = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${BACKEND_URL}/ai/history/${id}`, {
        headers: { token },
      });
      const data = response.data;
      setConversationId(data.conversationId);
      setMessages(
        (data.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );
      setDraft(data.draft);
      setMissingFields(data.missingFields || []);
      setReadyToCreate(Boolean(data.readyToCreate));
      setView("chat");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not open that chat."));
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || sending || creating) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    if (isHistoryRequest(text)) {
      setSending(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(BACKEND_URL + "/ai/history", {
          headers: { token },
        });
        const chats = response.data.chats || [];
        setHistory(chats);
        const count = chats.length;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              count > 0
                ? `I found ${count} saved chat${count === 1 ? "" : "s"}. Opening your history — tap any chat to continue it.`
                : "You don't have any saved chats yet. Start by describing a task, and I'll keep the conversation here for later.",
          },
        ]);
        if (count > 0) setView("history");
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I couldn't load your history right now. Try the History button above.",
          },
        ]);
      } finally {
        setSending(false);
      }
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        BACKEND_URL + "/ai/task-chat",
        { message: text, conversationId },
        { headers: { token } }
      );

      const data = response.data;
      setConversationId(data.conversationId);
      setDraft(data.draft);
      setMissingFields(data.missingFields || []);
      setReadyToCreate(Boolean(data.readyToCreate));
      if (data.readyToCreate) setView("draft");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Taskiii failed."));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry — Taskiii couldn't process that. Please try again in a moment.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const createTask = async () => {
    if (!readyToCreate || creating) return;
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        BACKEND_URL + "/ai/task-create",
        { conversationId, draft },
        { headers: { token } }
      );
      toast.success("Task created with Taskiii.");
      setOpen(false);
      await refreshTasks();
      setConversationId(null);
      setDraft(null);
      setMissingFields([]);
      setReadyToCreate(false);
      setInput("");
      setMessages([{ role: "assistant", content: WELCOME }]);
      setView("chat");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not create task."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {showTip && !open && (
        <div className="pointer-events-auto relative max-w-[16.5rem] sm:max-w-[18rem] rounded-2xl border border-white/15 bg-[#0f172a]/95 px-3.5 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl tf-animate-fade-up">
          <button
            type="button"
            onClick={dismissTip}
            className="absolute right-1.5 top-1.5 h-7 w-7 grid place-items-center rounded-lg text-stone-400 hover:text-stone-100 hover:bg-white/10 transition-colors"
            aria-label="Dismiss tip"
            title="Dismiss"
          >
            ×
          </button>
          <div className="pr-6">
            <p className="font-display text-sm font-semibold text-stone-50">
              Meet Taskiii
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-stone-300">
              Your AI helper for creating tasks in plain English. Tap the sparkle
              anytime — chats are saved so you can reopen them later.
            </p>
          </div>
          <div
            className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-r border-b border-white/15 bg-[#0f172a]/95"
            aria-hidden
          />
        </div>
      )}

      {open && (
        <div
          className="pointer-events-auto w-[min(100vw-1.5rem,24rem)] sm:w-[26rem] h-[min(72vh,560px)] flex flex-col rounded-2xl overflow-hidden border border-white/12 bg-[#0f172a]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] tf-animate-fade-up"
          role="dialog"
          aria-label="Taskiii"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-teal-500/15 via-transparent to-violet-500/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-violet-500 text-white shadow-sm">
                <TaskiiiMark className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-stone-50 leading-tight">
                  Taskiii
                </p>
                <p className="text-[11px] text-stone-400 truncate">
                  {sending
                    ? "Thinking…"
                    : view === "history"
                      ? "Previous chats"
                      : view === "draft"
                        ? "Draft preview"
                        : "Ready to help"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={openHistory}
                className={`h-8 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                  view === "history"
                    ? "bg-teal-500/20 text-teal-200"
                    : "text-stone-400 hover:text-stone-200 hover:bg-white/8"
                }`}
                title="Previous chats"
              >
                History
              </button>
              <button
                type="button"
                onClick={() =>
                  setView((v) => (v === "draft" ? "chat" : "draft"))
                }
                className={`h-8 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                  view === "draft"
                    ? "bg-teal-500/20 text-teal-200"
                    : "text-stone-400 hover:text-stone-200 hover:bg-white/8"
                }`}
                title="Toggle draft"
              >
                Draft
              </button>
              <button
                type="button"
                onClick={startFreshChat}
                disabled={sending || creating}
                className="h-8 w-8 grid place-items-center rounded-lg text-stone-400 hover:text-stone-100 hover:bg-white/8 transition-colors disabled:opacity-40"
                title="New chat"
                aria-label="New chat"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={sending || creating}
                className="h-8 w-8 grid place-items-center rounded-lg text-stone-400 hover:text-stone-100 hover:bg-white/8 transition-colors"
                aria-label="Close Taskiii"
              >
                ×
              </button>
            </div>
          </div>

          {view === "history" ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {historyLoading ? (
                  <p className="text-sm text-stone-400 px-1 py-6 text-center">
                    Loading chats…
                  </p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-stone-400 px-1 py-6 text-center leading-relaxed">
                    No saved chats yet. Start a conversation and Taskiii will
                    keep it here.
                  </p>
                ) : (
                  history.map((chat) => (
                    <button
                      key={chat.conversationId}
                      type="button"
                      onClick={() => openPastChat(chat.conversationId)}
                      className="w-full text-left rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-stone-50 line-clamp-1">
                          {chat.title || "Chat"}
                        </p>
                        <span className="shrink-0 text-[10px] text-stone-500">
                          {formatChatTime(chat.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-stone-400 line-clamp-2">
                        {chat.preview || "No messages"}
                      </p>
                    </button>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  className="w-full h-9 rounded-xl text-xs font-medium text-stone-300 hover:text-stone-100 hover:bg-white/5 transition-colors"
                >
                  Back to chat
                </button>
              </div>
            </div>
          ) : view === "draft" ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                {[
                  "title",
                  "description",
                  "label",
                  "dueDate",
                  "status",
                  "assignedTo",
                  "important",
                ].map((key) => {
                  const missing = missingFields.includes(key);
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-stone-500">
                          {FIELD_LABELS[key] || key}
                        </span>
                        {missing && (
                          <span className="text-[10px] text-amber-300/90">
                            needed
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-0.5 text-sm break-words ${
                          missing
                            ? "text-stone-500 italic"
                            : "text-stone-200"
                        }`}
                      >
                        {formatDraftValue(key, draft)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={createTask}
                  disabled={!readyToCreate || creating || sending}
                  className="tf-btn-primary w-full h-10 rounded-xl text-sm font-semibold disabled:opacity-40"
                >
                  {creating
                    ? "Creating…"
                    : readyToCreate
                      ? "Create task"
                      : "Fill missing fields first"}
                </button>
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  className="w-full h-9 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-white/5 transition-colors"
                >
                  Back to chat
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5"
              >
                {messages.map((m, i) => (
                  <div
                    key={`${m.role}-${i}`}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                        m.role === "user"
                          ? "bg-teal-500/90 text-white rounded-br-md"
                          : "bg-white/[0.06] text-stone-200 border border-white/10 rounded-bl-md"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md px-3 py-2 text-[13px] bg-white/[0.06] border border-white/10 text-stone-400">
                      Thinking…
                    </div>
                  </div>
                )}
              </div>

              {readyToCreate && (
                <div className="px-3 pb-1">
                  <button
                    type="button"
                    onClick={createTask}
                    disabled={creating || sending}
                    className="w-full h-9 rounded-xl text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30 hover:bg-teal-500/30 transition-colors disabled:opacity-40"
                  >
                    {creating ? "Creating…" : "Draft ready — Create task"}
                  </button>
                </div>
              )}

              <form
                onSubmit={sendMessage}
                className="p-3 border-t border-white/10 flex gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Try “show my previous chats”…'
                  disabled={sending || creating}
                  className="tf-input flex-1 h-10 rounded-xl text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending || creating}
                  className="h-10 w-10 shrink-0 grid place-items-center rounded-xl bg-teal-500/90 hover:bg-teal-400 text-white transition-colors disabled:opacity-40"
                  aria-label="Send"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.4 20.6 21 12 3.4 3.4 3 10.1 14 12 3 13.9z" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`pointer-events-auto group relative h-14 w-14 rounded-full grid place-items-center text-white transition-all duration-300 hover:scale-105 active:scale-95 ${
          open
            ? "bg-[#152036] border border-white/20 shadow-[0_10px_28px_rgba(0,0,0,0.4)]"
            : "tf-taskiii-fab border border-white/20"
        }`}
        aria-label={open ? "Close Taskiii" : "Open Taskiii"}
        title="Taskiii"
      >
        {!open && (
          <span
            className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-300/30 via-transparent to-violet-400/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden
          />
        )}
        <span className="relative z-10 grid place-items-center">
          {open ? (
            <svg
              className="h-5 w-5 text-stone-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeWidth="2.25"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          ) : (
            <TaskiiiMark className="h-6 w-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" />
          )}
        </span>
      </button>
    </div>
  );
}
