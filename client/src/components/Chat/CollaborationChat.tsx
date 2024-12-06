import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, RoomUser } from '../../types/collaboration';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

interface CollaborationChatProps {
  roomId: string;
  messages: ChatMessage[];
  users: RoomUser[];
}

const CollaborationChat: React.FC<CollaborationChatProps> = ({ roomId, messages, users }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (!socket) return;

    // Escuchar eventos de escritura
    socket.on('chat:typing', ({ userId, isTyping: typing }) => {
      setIsTyping(prev => ({ ...prev, [userId]: typing }));

      // Limpiar el estado de escritura después de un tiempo
      if (typing && typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }

      if (typing) {
        typingTimeoutRef.current[userId] = setTimeout(() => {
          setIsTyping(prev => ({ ...prev, [userId]: false }));
        }, 3000);
      }
    });

    return () => {
      socket.off('chat:typing');
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    const message: Partial<ChatMessage> = {
      content: newMessage.trim(),
      type: 'text',
      replyTo: replyTo?.id
    };

    socket.emit('chat:message', {
      roomId,
      message
    });

    setNewMessage('');
    setReplyTo(null);
  };

  const handleTyping = () => {
    if (!socket || !user) return;

    socket.emit('chat:typing', {
      roomId,
      isTyping: true
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.userId === user?.id;
    const messageUser = users.find(u => u.id === message.userId);

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : ''}`}>
          {/* Mensaje respondido */}
          {message.replyTo && (
            <div className="mb-2 ml-2">
              <div className="bg-[#2C2C2C] rounded p-2 text-sm text-gray-400">
                {messages.find(m => m.id === message.replyTo)?.content}
              </div>
            </div>
          )}

          {/* Contenido principal del mensaje */}
          <div className="flex items-end space-x-2">
            {!isOwnMessage && (
              <div className="flex flex-col items-center space-y-1">
                {messageUser?.avatar ? (
                  <img
                    src={messageUser.avatar}
                    alt={messageUser.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3C3C3C] flex items-center justify-center">
                    <span className="material-icons text-[#DAA520]">person</span>
                  </div>
                )}
                <span className={`text-xs ${getRoleColor(messageUser?.role)}`}>
                  {messageUser?.name}
                </span>
              </div>
            )}

            <div
              className={`rounded-lg p-3 ${
                isOwnMessage
                  ? 'bg-[#DAA520] text-white'
                  : message.type === 'system'
                  ? 'bg-[#2C2C2C] text-gray-400'
                  : 'bg-[#3C3C3C] text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="mt-1 text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'coach':
        return 'text-[#DAA520]';
      case 'analyst':
        return 'text-blue-400';
      case 'viewer':
        return 'text-gray-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />

        {/* Indicadores de escritura */}
        <AnimatePresence>
          {Object.entries(isTyping).map(([userId, typing]) =>
            typing ? (
              <motion.div
                key={userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex items-center space-x-2 text-gray-400"
              >
                <span className="text-sm">
                  {users.find(u => u.id === userId)?.name} está escribiendo...
                </span>
                <div className="flex space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.1, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* Área de respuesta */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#2C2C2C] p-2 mx-4 rounded-t-lg"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Respondiendo a {users.find(u => u.id === replyTo.userId)?.name}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-icons text-sm">close</span>
              </motion.button>
            </div>
            <p className="text-sm text-gray-400 truncate">{replyTo.content}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de mensaje */}
      <div className="p-4 bg-[#1A1A1A]">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            onInput={handleTyping}
            className="flex-1 bg-[#2C2C2C] text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#DAA520] outline-none"
            placeholder="Escribe un mensaje..."
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="bg-[#DAA520] text-white p-2 rounded-lg"
          >
            <span className="material-icons">send</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationChat;
