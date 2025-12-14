import React, { useEffect, useRef, useState } from "react";
import { Send, X, MessageSquare, BarChart2 } from "lucide-react";
import { useSyncRoomContext } from "../contexts/SyncRoomContext";
import type { ChatMessage } from "../types/chat";
import { Polls } from "./Polls";

interface ChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "chat" | "polls";

export function ChatRoom({ isOpen, onClose }: ChatRoomProps) {
  const { userId, chatMessages, send, isSending } = useSyncRoomContext();
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  // Chat logic
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = (date: number) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [isOpen, activeTab]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const payload: ChatMessage = {
      message: inputMessage,
      type: "text",
    };

    send(JSON.stringify(payload));
    setInputMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex flex-col border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3">
          <h3 className="m-0 text-base font-semibold text-gray-800">
            {activeTab === "chat" ? "In-call messages" : "Polls"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "chat"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            <MessageSquare size={18} />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("polls")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "polls"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            <BarChart2 size={18} />
            Polls
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">

        {/* Chat Content */}
        <div className={`absolute inset-0 flex flex-col ${activeTab === "chat" ? "visible z-10" : "invisible z-0"}`}>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-400 mt-10 text-sm">
                No messages yet. Start the conversation!
              </div>
            )}

            {chatMessages.map((msg, index) => {
              const msgData = JSON.parse(msg.message) as ChatMessage;
              if (msgData.type === "joined") {
                return (
                  <div key={index} className="mb-4 text-center text-xs text-gray-500 w-full py-1">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      <strong className="font-semibold text-gray-700">{msgData.message}</strong> joined
                    </span>
                  </div>
                );
              }

              const isMine = msg.from?.identity === userId;
              return (
                <div
                  key={index}
                  className={`mb-3 flex flex-col ${isMine ? "items-end" : "items-start"} max-w-full`}
                >
                  {!isMine && (
                    <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">
                      {msg.from?.name || "Unknown"}
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${isMine
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                      }`}
                  >
                    <p className="m-0 whitespace-pre-wrap break-words">{msgData.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2 items-end bg-gray-100 p-2 rounded-xl">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm max-h-24 py-2 px-1 text-gray-800 placeholder-gray-500"
                style={{ minHeight: '36px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !inputMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Polls Content */}
        <div className={`absolute inset-0 bg-white ${activeTab === "polls" ? "visible z-10" : "invisible z-0"}`}>
          <Polls />
        </div>

      </div>
    </div>
  );
}
