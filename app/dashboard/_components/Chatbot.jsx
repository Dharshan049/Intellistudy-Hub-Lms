"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { MessageCircle, Send, X, Bot, Loader2 } from "lucide-react";
import "./Chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef(null);

  // Check theme from localStorage
  useEffect(() => {
    const checkTheme = () => {
      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");
    };

    // Initial check
    checkTheme();

    // Setup event listener for theme changes
    window.addEventListener("storage", checkTheme);

    // Check for theme changes every 100ms
    const interval = setInterval(checkTheme, 100);

    return () => {
      window.removeEventListener("storage", checkTheme);
      clearInterval(interval);
    };
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: userMessage }] }],
        }
      );

      const aiMessage = response.data.candidates[0].content.parts[0].text;
      setMessages((prev) => [...prev, { role: "assistant", content: aiMessage }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="chat-toggle-container">
          <button
            onClick={() => setIsOpen(true)}
            className="chat-toggle-btn"
            aria-label="Open chat"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          {showTooltip && (
            <div className="chat-tooltip">
              Chat AI
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? "open" : "closed"} ${isDarkMode ? "dark" : "light"}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium">AI Assistant</span>
            </div>
            <span className="text-xs opacity-75 mt-1">Powered by Gemini</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="close-btn"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <Bot className="w-8 h-8 mb-2" />
              <p>Hello! How can I assist you today?</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === "user" ? "user" : "assistant"}`}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant loading">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="send-btn"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
} 