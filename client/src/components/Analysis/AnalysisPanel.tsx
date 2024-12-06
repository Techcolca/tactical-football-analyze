import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Analysis } from '../../types/collaboration';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

interface AnalysisPanelProps {
  roomId: string;
  analysis: Analysis;
  editable: boolean;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ roomId, analysis, editable }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(analysis.title);
  const [editedDescription, setEditedDescription] = useState(analysis.description);
  const [newTag, setNewTag] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Escuchar eventos de escritura de la IA
    socket.on('analysis:ai-typing', ({ status }) => {
      setIsAiTyping(status === 'started');
      if (status === 'completed') {
        setShowSuggestions(true);
      }
    });

    return () => {
      socket.off('analysis:ai-typing');
    };
  }, [socket]);

  const handleSave = () => {
    if (!socket) return;

    socket.emit('analysis:update', {
      roomId,
      analysis: {
        ...analysis,
        title: editedTitle,
        description: editedDescription
      }
    });

    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (!socket || !newTag.trim()) return;

    socket.emit('analysis:add-tag', {
      roomId,
      tag: newTag
    });

    setNewTag('');
  };

  const requestAiSuggestions = () => {
    if (!socket) return;

    socket.emit('analysis:request-suggestions', {
      roomId,
      context: editedDescription
    });
  };

  const applySuggestion = (suggestion: string) => {
    setEditedDescription(prev => prev + '\n\n' + suggestion);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 space-y-6">
      {/* Título */}
      <div className="space-y-2">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full bg-[#2C2C2C] text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#DAA520] outline-none"
            placeholder="Título del análisis"
          />
        ) : (
          <h2 className="text-2xl font-bold text-white">
            {analysis.title}
          </h2>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        {isEditing ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full h-48 bg-[#2C2C2C] text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#DAA520] outline-none resize-none"
            placeholder="Describe tu análisis táctico..."
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            {analysis.description.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-300">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Etiquetas */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {analysis.tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#2C2C2C] text-white px-3 py-1 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
          {editable && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="bg-[#2C2C2C] text-white px-3 py-1 rounded-full text-sm focus:ring-2 focus:ring-[#DAA520] outline-none"
                placeholder="Nueva etiqueta..."
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddTag}
                className="bg-[#DAA520] text-white p-1 rounded-full"
              >
                <span className="material-icons text-sm">add</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Sugerencias de la IA */}
      <AnimatePresence>
        {showSuggestions && analysis.aiSuggestions && analysis.aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h3 className="text-[#DAA520] font-bold">Sugerencias de la IA</h3>
            <div className="space-y-2">
              {analysis.aiSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#2C2C2C] p-4 rounded-lg"
                >
                  <p className="text-gray-300">{suggestion}</p>
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => applySuggestion(suggestion)}
                      className="mt-2 text-[#DAA520] text-sm hover:underline"
                    >
                      Aplicar sugerencia
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controles de edición */}
      {editable && (
        <div className="flex justify-between items-center">
          <div className="space-x-2">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="bg-[#DAA520] text-white px-4 py-2 rounded-lg"
                >
                  Guardar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="bg-[#2C2C2C] text-white px-4 py-2 rounded-lg"
                >
                  Cancelar
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="bg-[#2C2C2C] text-white px-4 py-2 rounded-lg"
              >
                Editar
              </motion.button>
            )}
          </div>

          {isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={requestAiSuggestions}
              className="flex items-center space-x-2 bg-[#2C2C2C] text-white px-4 py-2 rounded-lg"
              disabled={isAiTyping}
            >
              {isAiTyping ? (
                <>
                  <span className="material-icons animate-spin">refresh</span>
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <span className="material-icons">psychology</span>
                  <span>Solicitar sugerencias</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
