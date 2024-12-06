import React from 'react';
import { motion } from 'framer-motion';

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    number: number;
    position: string;
    stats?: {
      pace: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defending: number;
      physical: number;
    };
    rating?: number;
    image?: string;
  };
  selected?: boolean;
  onClick?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, selected, onClick }) => {
  const getPositionColor = (position: string) => {
    switch (position.toUpperCase()) {
      case 'ST':
      case 'CF':
      case 'LW':
      case 'RW':
        return 'from-red-600 to-red-800';
      case 'CAM':
      case 'CM':
      case 'CDM':
      case 'LM':
      case 'RM':
        return 'from-green-600 to-green-800';
      case 'CB':
      case 'LB':
      case 'RB':
      case 'LWB':
      case 'RWB':
        return 'from-blue-600 to-blue-800';
      case 'GK':
        return 'from-yellow-600 to-yellow-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'text-white';
    if (rating >= 85) return 'text-yellow-400';
    if (rating >= 80) return 'text-green-400';
    if (rating >= 75) return 'text-blue-400';
    return 'text-gray-400';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={selected ? { y: -10 } : { y: 0 }}
      onClick={onClick}
      className={`relative w-48 h-64 rounded-lg overflow-hidden cursor-pointer
        ${selected ? 'ring-2 ring-[#DAA520]' : ''}`}
    >
      {/* Fondo con gradiente */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getPositionColor(player.position)} opacity-90`} />
      
      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-10" />

      {/* Contenido */}
      <div className="relative p-4 h-full flex flex-col">
        {/* Cabecera */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className={`text-3xl font-bold ${getRatingColor(player.rating)}`}>
              {player.rating || '?'}
            </div>
            <div className="text-white font-semibold">{player.position}</div>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-black">{player.number}</span>
          </div>
        </div>

        {/* Imagen del jugador */}
        <div className="flex-1 flex items-center justify-center">
          {player.image ? (
            <img
              src={player.image}
              alt={player.name}
              className="max-h-28 w-auto filter drop-shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
              <span className="material-icons text-4xl text-white">sports_soccer</span>
            </div>
          )}
        </div>

        {/* Nombre del jugador */}
        <div className="text-center mt-2">
          <h3 className="text-white font-bold text-lg truncate">{player.name}</h3>
        </div>

        {/* Estadísticas */}
        {player.stats && (
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-white">
            <div className="flex justify-between">
              <span>PAC</span>
              <span className="font-bold">{player.stats.pace}</span>
            </div>
            <div className="flex justify-between">
              <span>SHO</span>
              <span className="font-bold">{player.stats.shooting}</span>
            </div>
            <div className="flex justify-between">
              <span>PAS</span>
              <span className="font-bold">{player.stats.passing}</span>
            </div>
            <div className="flex justify-between">
              <span>DRI</span>
              <span className="font-bold">{player.stats.dribbling}</span>
            </div>
            <div className="flex justify-between">
              <span>DEF</span>
              <span className="font-bold">{player.stats.defending}</span>
            </div>
            <div className="flex justify-between">
              <span>PHY</span>
              <span className="font-bold">{player.stats.physical}</span>
            </div>
          </div>
        )}
      </div>

      {/* Efecto de brillo en hover */}
      <motion.div
        className="absolute inset-0 bg-white opacity-0"
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default PlayerCard;
