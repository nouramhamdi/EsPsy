import React, { useEffect, useRef, useState } from "react";
import { IoMdClose, IoMdChatbubbles } from "react-icons/io";
import { MdSend } from "react-icons/md";
import chatbotService from "../../Services/chatbotService"; // Adjust path

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const AI_ID = "67c2095373458e5969771c55"; // Fixed AI ID
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && loggedUser) {
      const initializeChat = async () => {
        try {
          // Check existing session
          const sessionResponse = await chatbotService.getSessionId(
            loggedUser._id,
            AI_ID
          );
        console.log('1');
          if (sessionResponse.found) {
            console.log('2');

            setSessionId(sessionResponse.session.id);
            const history = await chatbotService.getHistory(sessionResponse.session.id);
            setMessages(history.messages);
            alert("Welcome back! You can continue your conversation.");
          } else {
            // Create new session
            console.log('3');
            const newSession = await chatbotService.startSession(
              loggedUser._id,
              AI_ID
            );
            setSessionId(newSession._id);
            setMessages([]);
            alert("New session started. Please start chatting!");
          }
        } catch (error) {
          console.error("Chat initialization failed:", error);
        }
      };
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    try {
      // Add user message
      setMessages(prev => [...prev, {
        content: input,
        senderType: "user",
        timestamp: new Date()
      }]);

      // Send to backend
      const response = await chatbotService.addMessage(sessionId, input);
      
      // Add AI response
      setMessages(prev => [...prev, {
        content: response.response,
        senderType: "ai",
        timestamp: new Date()
      }]);

      setInput("");
    } catch (error) {
      console.error("Message send failed:", error);
    }
  };

  return (
    <div className="fixed bottom-32 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1977cc] text-white p-3 rounded-full shadow-lg hover:bg-[#1763a7] transition-colors"
      >
        <IoMdChatbubbles size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">EsPsy Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoMdClose size={24} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="h-96 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.senderType === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.senderType === "user"
                      ? "bg-[#1977cc] text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1977cc]"
              />
              <button
                type="submit"
                className="bg-[#1977cc] text-white p-2 rounded-lg hover:bg-[#1763a7] transition-colors"
              >
                <MdSend size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;