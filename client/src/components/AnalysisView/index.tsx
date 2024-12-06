import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExportPanel } from '../ExportTools/ExportPanel';
import { exportService, ExportOptions } from '../../services/exportService';
import { useAnalysisContext } from '../../contexts/AnalysisContext';
import { HeatMap } from '../AnalysisTools/HeatMap';
import { PassingNetwork } from '../AnalysisTools/PassingNetwork';
import { PressureMap } from '../AnalysisTools/PressureMap';
import { ZonalAnalysis } from '../AnalysisTools/ZonalAnalysis';

const AnalysisView: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const { 
    analysis, 
    formation, 
    metrics, 
    events,
    selectedTool,
    setSelectedTool 
  } = useAnalysisContext();

  const handleExport = async (format: string, options: ExportOptions) => {
    try {
      setIsExporting(true);
      await exportService.exportAnalysis(
        format,
        options,
        analysis,
        formation,
        metrics,
        events
      );
      // Mostrar notificación de éxito
      showNotification('Exportación completada con éxito', 'success');
    } catch (error) {
      console.error('Error en la exportación:', error);
      showNotification('Error al exportar el análisis', 'error');
    } finally {
      setIsExporting(false);
      setShowExportPanel(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Implementar sistema de notificaciones aquí
    console.log(`${type}: ${message}`);
  };

  const tools = [
    { id: 'heatmap', name: 'Mapa de Calor', icon: 'whatshot', component: HeatMap },
    { id: 'passing', name: 'Red de Pases', icon: 'share', component: PassingNetwork },
    { id: 'pressure', name: 'Mapa de Presión', icon: 'track_changes', component: PressureMap },
    { id: 'zonal', name: 'Análisis Zonal', icon: 'grid_on', component: ZonalAnalysis },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-6">
      {/* Barra de herramientas */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                selectedTool === tool.id
                  ? 'bg-[#DAA520] text-[#0A2342]'
                  : 'bg-[#2C2C2C] hover:bg-[#3C3C3C]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTool(tool.id)}
            >
              <span className="material-icons">{tool.icon}</span>
              <span>{tool.name}</span>
            </motion.button>
          ))}
        </div>

        <motion.button
          className="bg-[#DAA520] text-[#0A2342] px-6 py-2 rounded-lg flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExportPanel(true)}
        >
          <span className="material-icons">file_download</span>
          <span>Exportar</span>
        </motion.button>
      </div>

      {/* Área principal de análisis */}
      <div className="bg-[#2C2C2C] rounded-lg p-6 mb-8 min-h-[60vh]">
        {tools.map((tool) => (
          selectedTool === tool.id && (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <tool.component />
            </motion.div>
          )
        ))}
      </div>

      {/* Panel de exportación */}
      <AnimatePresence>
        {showExportPanel && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative"
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setShowExportPanel(false)}
              >
                <span className="material-icons">close</span>
              </button>
              <ExportPanel
                onExport={handleExport}
                isExporting={isExporting}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalysisView;
