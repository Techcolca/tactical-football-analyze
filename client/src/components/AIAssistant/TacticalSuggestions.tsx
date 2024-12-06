import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TacticalSuggestion } from '../../../server/src/types/analysis';

interface TacticalSuggestionsProps {
  suggestions: TacticalSuggestion[];
  onSuggestionSelect: (suggestion: TacticalSuggestion) => void;
}

const TacticalSuggestions: React.FC<TacticalSuggestionsProps> = ({
  suggestions,
  onSuggestionSelect,
}) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<TacticalSuggestion | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movement':
        return 'directions_run';
      case 'pressing':
        return 'front_hand';
      case 'positioning':
        return 'place';
      case 'passing':
        return 'sports_soccer';
      default:
        return 'help';
    }
  };

  return (
    <div className="w-full max-w-md bg-[#2C2C2C] rounded-lg shadow-xl">
      <div className="p-4 border-b border-[#DAA520]">
        <h3 className="text-[#DAA520] text-lg font-bold">Sugerencias Tácticas</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border-b border-[#DAA520]/20 cursor-pointer hover:bg-[#0A2342] transition-colors ${
                selectedSuggestion === suggestion ? 'bg-[#0A2342]' : ''
              }`}
              onClick={() => {
                setSelectedSuggestion(suggestion);
                onSuggestionSelect(suggestion);
              }}
            >
              <div className="flex items-center space-x-4">
                {/* Icono del tipo de sugerencia */}
                <div className="w-10 h-10 rounded-full bg-[#DAA520]/20 flex items-center justify-center">
                  <span className="material-icons text-[#DAA520]">
                    {getTypeIcon(suggestion.type)}
                  </span>
                </div>

                {/* Contenido de la sugerencia */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${getPriorityColor(suggestion.priority)}`} />
                    <h4 className="text-white font-semibold">
                      {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{suggestion.description}</p>
                </div>

                {/* Flecha de expansión */}
                <motion.div
                  animate={{ rotate: selectedSuggestion === suggestion ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="material-icons text-[#DAA520]">expand_more</span>
                </motion.div>
              </div>

              {/* Panel expandible con detalles */}
              <AnimatePresence>
                {selectedSuggestion === suggestion && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pl-14"
                  >
                    {/* Jugadores involucrados */}
                    <div className="mb-2">
                      <h5 className="text-[#DAA520] text-sm font-semibold mb-1">Jugadores:</h5>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.players.map((player, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-[#DAA520]/20 rounded-full text-xs text-white"
                          >
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Área afectada */}
                    <div>
                      <h5 className="text-[#DAA520] text-sm font-semibold mb-1">Área:</h5>
                      <div className="w-full h-32 relative bg-[#0A2342] rounded-lg overflow-hidden">
                        {/* Miniatura del campo con área resaltada */}
                        <div
                          className="absolute bg-[#DAA520]/30 border border-[#DAA520]"
                          style={{
                            left: `${suggestion.area.x1 * 100}%`,
                            top: `${suggestion.area.y1 * 100}%`,
                            width: `${(suggestion.area.x2 - suggestion.area.x1) * 100}%`,
                            height: `${(suggestion.area.y2 - suggestion.area.y1) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TacticalSuggestions;
