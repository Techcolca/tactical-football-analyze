import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportPanelProps {
  onExport: (format: string, options: any) => Promise<void>;
  isExporting: boolean;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ onExport, isExporting }) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [options, setOptions] = useState({
    includeHeatmaps: true,
    includePlayerStats: true,
    includeTimeline: true,
    includeAnalysis: true,
    quality: 'high',
  });

  const formats = [
    {
      id: 'pdf',
      name: 'PDF Interactivo',
      icon: 'picture_as_pdf',
      description: 'Reporte detallado con gráficos interactivos',
    },
    {
      id: 'excel',
      name: 'Excel Analítico',
      icon: 'table_chart',
      description: 'Datos detallados en formato tabular',
    },
    {
      id: 'video',
      name: 'Video Táctico',
      icon: 'movie',
      description: 'Animación de jugadas y análisis',
    },
    {
      id: 'presentation',
      name: 'Presentación',
      icon: 'slideshow',
      description: 'Diapositivas para reuniones de equipo',
    },
  ];

  return (
    <div className="bg-[#2C2C2C] rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
      <h2 className="text-[#DAA520] text-2xl font-bold mb-6">
        Exportar Análisis
      </h2>

      {/* Selector de formato */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {formats.map((format) => (
          <motion.button
            key={format.id}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedFormat === format.id
                ? 'border-[#DAA520] bg-[#0A2342]'
                : 'border-gray-600 hover:border-[#DAA520]'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedFormat(format.id)}
          >
            <div className="flex items-center space-x-3">
              <span className="material-icons text-[#DAA520] text-2xl">
                {format.icon}
              </span>
              <div className="text-left">
                <h3 className="text-white font-semibold">{format.name}</h3>
                <p className="text-gray-400 text-sm">{format.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Opciones de exportación */}
      <div className="bg-[#0A2342] rounded-lg p-4 mb-6">
        <h3 className="text-[#DAA520] font-semibold mb-4">
          Opciones de Exportación
        </h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeHeatmaps}
              onChange={(e) =>
                setOptions({ ...options, includeHeatmaps: e.target.checked })
              }
              className="form-checkbox text-[#DAA520]"
            />
            <span className="text-white">Incluir mapas de calor</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includePlayerStats}
              onChange={(e) =>
                setOptions({ ...options, includePlayerStats: e.target.checked })
              }
              className="form-checkbox text-[#DAA520]"
            />
            <span className="text-white">Incluir estadísticas de jugadores</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeTimeline}
              onChange={(e) =>
                setOptions({ ...options, includeTimeline: e.target.checked })
              }
              className="form-checkbox text-[#DAA520]"
            />
            <span className="text-white">Incluir línea de tiempo</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeAnalysis}
              onChange={(e) =>
                setOptions({ ...options, includeAnalysis: e.target.checked })
              }
              className="form-checkbox text-[#DAA520]"
            />
            <span className="text-white">Incluir análisis táctico</span>
          </label>
        </div>

        {/* Selector de calidad */}
        <div className="mt-4">
          <h4 className="text-[#DAA520] font-semibold mb-2">Calidad</h4>
          <select
            value={options.quality}
            onChange={(e) =>
              setOptions({ ...options, quality: e.target.value })
            }
            className="w-full bg-[#2C2C2C] text-white rounded-lg p-2 border border-gray-600 focus:border-[#DAA520] outline-none"
          >
            <option value="low">Baja (más rápido)</option>
            <option value="medium">Media</option>
            <option value="high">Alta (mejor calidad)</option>
          </select>
        </div>
      </div>

      {/* Botón de exportación */}
      <motion.button
        className={`w-full py-3 rounded-lg font-semibold ${
          isExporting
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-[#DAA520] hover:bg-[#B8860B]'
        } text-[#0A2342] transition-colors`}
        whileHover={!isExporting ? { scale: 1.02 } : {}}
        whileTap={!isExporting ? { scale: 0.98 } : {}}
        onClick={() => onExport(selectedFormat, options)}
        disabled={isExporting}
      >
        <div className="flex items-center justify-center space-x-2">
          {isExporting ? (
            <>
              <motion.span
                className="material-icons animate-spin"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                refresh
              </motion.span>
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <span className="material-icons">file_download</span>
              <span>Exportar {formats.find(f => f.id === selectedFormat)?.name}</span>
            </>
          )}
        </div>
      </motion.button>

      {/* Indicador de progreso */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4"
          >
            <div className="w-full bg-[#0A2342] rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-[#DAA520]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </div>
            <p className="text-center text-gray-400 text-sm mt-2">
              Generando reporte detallado...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportPanel;
