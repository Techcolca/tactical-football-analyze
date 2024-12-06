import React from 'react';
import { motion } from 'framer-motion';

interface Tool {
  id: string;
  icon: string;
  name: string;
  action: () => void;
}

interface ToolbarProps {
  tools: Tool[];
  activeTool: string;
  onToolSelect: (toolId: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ tools, activeTool, onToolSelect }) => {
  return (
    <div className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-[#2C2C2C] p-2 rounded-r-lg border-r-2 border-[#DAA520]">
      <div className="flex flex-col space-y-4">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              activeTool === tool.id
                ? 'bg-[#DAA520] text-[#0A2342]'
                : 'bg-[#0A2342] text-[#DAA520]'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToolSelect(tool.id)}
          >
            <span className="material-icons">{tool.icon}</span>
            <span className="sr-only">{tool.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
