import React from 'react';
import { motion } from 'framer-motion';
import { PerformanceMetrics } from '../../../server/src/types/analysis';
import * as d3 from 'd3';

interface PerformanceAnalysisProps {
  metrics: PerformanceMetrics;
}

const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ metrics }) => {
  const renderMetricGauge = (value: number, label: string, color: string) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <svg width="100" height="100" className="transform -rotate-90">
          {/* Fondo del gauge */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#2C2C2C"
            strokeWidth="8"
            fill="none"
          />
          {/* Progreso del gauge */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {/* Valor central */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-bold"
            fill={color}
          >
            {value}%
          </text>
        </svg>
        <span className="text-sm text-[#DAA520] mt-2">{label}</span>
      </div>
    );
  };

  const renderHeatmap = () => {
    // Configuración del heatmap
    const width = 300;
    const height = 200;
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(metrics.heatmap, d => d.intensity) || 1]);

    return (
      <div className="mt-4">
        <h4 className="text-[#DAA520] font-semibold mb-2">Mapa de Calor</h4>
        <svg width={width} height={height} className="bg-[#0A2342] rounded-lg">
          {metrics.heatmap.map((point, i) => (
            <circle
              key={i}
              cx={point.x * width}
              cy={point.y * height}
              r={10}
              fill={colorScale(point.intensity)}
              opacity={0.6}
            >
              <animate
                attributeName="opacity"
                values="0.6;0.8;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-[#2C2C2C] rounded-lg p-6 shadow-xl">
      <h3 className="text-[#DAA520] text-xl font-bold mb-6">Análisis de Rendimiento</h3>

      {/* Métricas principales */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {renderMetricGauge(metrics.possessionPercentage, 'Posesión', '#DAA520')}
        {renderMetricGauge(metrics.passAccuracy, 'Precisión de Pases', '#4CAF50')}
        {renderMetricGauge(metrics.pressureSuccess, 'Éxito en Presión', '#2196F3')}
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0A2342] rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#DAA520]">Tiros a Puerta</span>
            <span className="text-white font-bold">{metrics.shotsOnTarget}</span>
          </div>
          <div className="w-full bg-[#2C2C2C] rounded-full h-2">
            <motion.div
              className="bg-[#DAA520] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(metrics.shotsOnTarget / 20) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="bg-[#0A2342] rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#DAA520]">Distancia (km)</span>
            <span className="text-white font-bold">
              {metrics.distanceCovered.toFixed(1)}
            </span>
          </div>
          <div className="w-full bg-[#2C2C2C] rounded-full h-2">
            <motion.div
              className="bg-[#DAA520] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(metrics.distanceCovered / 15) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Velocidad máxima */}
      <div className="bg-[#0A2342] rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#DAA520]">Velocidad Máxima (km/h)</span>
          <motion.span
            className="text-white font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {metrics.sprintSpeed.toFixed(1)}
          </motion.span>
        </div>
        <motion.div
          className="w-full h-8 bg-[#2C2C2C] rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="absolute h-full bg-gradient-to-r from-[#DAA520] to-[#FF4500]"
            style={{ width: `${(metrics.sprintSpeed / 35) * 100}%` }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>
      </div>

      {/* Mapa de calor */}
      {renderHeatmap()}
    </div>
  );
};

export default PerformanceAnalysis;
