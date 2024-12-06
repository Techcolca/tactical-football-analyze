import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'formation' | 'heatmap' | 'analysis' | 'suggestion';
    data: any;
  }[];
}

interface ChatInterfaceProps {
  onAnalysisRequest?: (analysis: any) => void;
  currentFormation?: string;
  currentAnalysis?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onAnalysisRequest,
  currentFormation,
  currentAnalysis
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensaje de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: `¡Hola ${user?.name}! Soy tu asistente táctico. Puedo ayudarte con:
        • Análisis de formaciones y tácticas
        • Sugerencias de movimientos para jugadores
        • Recomendaciones basadas en el rival
        • Análisis de fortalezas y debilidades
        
        ¿En qué puedo ayudarte hoy?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Simular respuesta del AI (reemplazar con llamada real al backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Analizando tu consulta...',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#2C2C2C] rounded-lg shadow-xl">
      {/* Header */}
      <div className="bg-[#0A2342] p-4 rounded-t-lg">
        <h2 className="text-[#DAA520] text-xl font-bold flex items-center">
          <span className="material-icons mr-2">sports_soccer</span>
          Asistente Táctico
        </h2>
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
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-[#DAA520] text-[#0A2342]'
                    : 'bg-[#1A1A1A] text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.attachments?.map((attachment, index) => (
                  <div
                    key={index}
                    className="mt-2 p-2 bg-[#2C2C2C] rounded-lg"
                  >
                    {/* Renderizar attachments según el tipo */}
                    {attachment.type === 'formation' && (
                      <div className="text-sm text-[#DAA520]">
                        Formación: {attachment.data}
                      </div>
                    )}
                    {/* Agregar más tipos de attachments según sea necesario */}
                  </div>
                ))}
                <span className="text-xs opacity-50 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-[#DAA520]"
          >
            <span className="material-icons animate-spin mr-2">autorenew</span>
            Analizando...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1A1A1A]">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu consulta táctica..."
            className="flex-1 bg-[#1A1A1A] text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
            rows={2}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`px-4 rounded-lg ${
              !input.trim() || isTyping
                ? 'bg-[#3C3C3C] cursor-not-allowed'
                : 'bg-[#DAA520] hover:bg-[#B8860B]'
            }`}
          >
            <span className="material-icons text-[#0A2342]">send</span>
          </motion.button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
