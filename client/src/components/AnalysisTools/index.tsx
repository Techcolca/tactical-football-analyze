import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HeatMap from './HeatMap';
import PassingNetwork from './PassingNetwork';
import PressureMap from './PressureMap';
import ZonalAnalysis from './ZonalAnalysis';

interface AnalysisToolsProps {
  width: number;
  height: number;
  data: {
    heatmap: any[];
    passes: any[];
    pressure: any[];
    zones: any[];
  };
}

const AnalysisTools: React.FC<AnalysisToolsProps> = ({ width, height, data }) => {
  const [activeTool, setActiveTool] = useState<string>('heatmap');

  const tools = [
    {
      id: 'heatmap',
      name: 'Mapa de Calor',
      icon: 'whatshot',
      component: HeatMap,
      data: data.heatmap,
    },
    {
      id: 'passing',
      name: 'Red de Pases',
      icon: 'timeline',
      component: PassingNetwork,
      data: data.passes,
    },
    {
      id: 'pressure',
      name: 'Mapa de Presión',
      icon: 'radio_button_checked',
      component: PressureMap,
      data: data.pressure,
    },
    {
      id: 'zonal',
      name: 'Análisis Zonal',
      icon: 'grid_on',
      component: ZonalAnalysis,
      data: data.zones,
    },
  ];

  return (
    <div className="relative">
      {/* Barra de herramientas */}
      <motion.div
        className="absolute top-4 left-4 bg-[#2C2C2C] rounded-lg shadow-lg p-2"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-2">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              className={`p-2 rounded-lg flex items-center space-x-2 ${
                activeTool === tool.id
                  ? 'bg-[#DAA520] text-[#0A2342]'
                  : 'text-[#DAA520] hover:bg-[#0A2342]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTool(tool.id)}
            >
              <span className="material-icons">{tool.icon}</span>
              <span className="text-sm">{tool.name}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Área de visualización */}
      <AnimatePresence mode="wait">
        {tools.map((tool) => {
          if (tool.id === activeTool) {
            const Component = tool.component;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Component
                  width={width}
                  height={height}
                  {...tool.data}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </AnimatePresence>

      {/* Leyenda */}
      <motion.div
        className="absolute bottom-4 right-4 bg-[#2C2C2C] rounded-lg shadow-lg p-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-[#DAA520] text-sm">
          {tools.find((t) => t.id === activeTool)?.name}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisTools;
