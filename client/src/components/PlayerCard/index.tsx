import React from 'react';
import { motion } from 'framer-motion';

interface PlayerCardProps {
  name: string;
  number: number;
  position: string;
  rating: number;
  image?: string;
  isDragging?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  number,
  position,
  rating,
  image,
  isDragging = false
}) => {
  return (
    <motion.div
      className={`w-32 h-48 rounded-lg relative cursor-grab ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Card Background with FIFA-style gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#DAA520] via-[#2C2C2C] to-[#000000] rounded-lg" />
      
      {/* Player Image */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden bg-[#0A2342] border-2 border-[#DAA520]">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#DAA520] text-2xl font-bold">
            {number}
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
        <div className="text-[#DAA520] font-bold text-lg">{rating}</div>
        <div className="text-white font-semibold text-sm truncate">{name}</div>
        <div className="text-[#DAA520] text-xs">{position}</div>
      </div>

      {/* Rating Badge */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-[#DAA520] flex items-center justify-center">
        <span className="text-black font-bold text-sm">{number}</span>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
