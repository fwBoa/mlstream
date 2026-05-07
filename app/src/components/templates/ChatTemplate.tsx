"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatTemplateProps {
  slug: string;
  name: string;
  description?: string;
  themeConfig?: Record<string, any>;
}

export default function ChatTemplate({ slug, name, description, themeConfig }: ChatTemplateProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apply theme configuration
  const customStyles = {
    "--accent-primary": themeConfig?.primary_color || "#4f46e5",
    "--bg-primary": themeConfig?.background_color || "#ffffff",
  } as React.CSSProperties;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/proxy/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantResponse += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = assistantResponse;
          return newMessages;
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-col max-w-4xl mx-auto rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm" style={customStyles}>
      <header className="text-center py-8 px-6 border-b border-gray-100 bg-white/50 backdrop-blur">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>
        {description && <p className="text-gray-500">{description}</p>}
      </header>

      <div className="flex-1 flex flex-col h-[600px] overflow-hidden bg-gray-50/30">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <p>Start a conversation with {name}</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === "user" 
                    ? "message-bubble user rounded-br-sm" 
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="max-w-[80%] px-4 py-4 rounded-2xl rounded-bl-sm bg-white border border-gray-200 shadow-sm flex items-center gap-1.5 h-10">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          {error && (
            <div className="self-center mt-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-500 text-sm">
              <p>{error}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200 flex gap-3 items-center">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm transition-shadow"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" className="px-6 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
