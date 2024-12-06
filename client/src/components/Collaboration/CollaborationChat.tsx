import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../contexts/SocketContext';
import { ChatMessage } from '../../types/collaboration';

interface CollaborationChatProps {
  messages: ChatMessage[];
  roomId: string;
  canChat: boolean;
}

const CollaborationChat: React.FC<CollaborationChatProps> = ({
  messages,
  roomId,
  canChat
}) => {
  const { socket } = useSocket();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!socket || !input.trim() || !canChat) return;

    socket.emit('chatMessage', {
      roomId,
      content: input.trim()
    });

    setInput('');
    setShowEmoji(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-[#0A2342] text-[#DAA520] text-center';
      case 'analysis':
        return 'bg-[#2C2C2C] text-white border border-[#DAA520]';
      default:
        return 'bg-[#3C3C3C] text-white';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#1A1A1A]">
        <h3 className="text-[#DAA520] font-bold">Chat del Equipo</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-3 rounded-lg ${getMessageStyle(message.type)}`}
            >
              {message.type !== 'system' && (
                <div className="flex items-center mb-1">
                  <span className="font-bold text-[#DAA520]">
                    {message.userName}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1A1A1A]">
        {canChat ? (
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="w-full bg-[#1A1A1A] text-white rounded-lg p-3 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
                rows={2}
              />
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="absolute right-2 top-2 text-[#DAA520] hover:text-[#B8860B]"
              >
                <span className="material-icons">emoji_emotions</span>
              </button>
              {showEmoji && (
                <div className="absolute bottom-full right-0 mb-2">
                  {/* Implementar selector de emojis */}
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim()}
              className={`px-4 rounded-lg ${
                !input.trim()
                  ? 'bg-[#3C3C3C] cursor-not-allowed'
                  : 'bg-[#DAA520] hover:bg-[#B8860B]'
              }`}
            >
              <span className="material-icons text-[#0A2342]">send</span>
            </motion.button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            No tienes permisos para enviar mensajes
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationChat;
