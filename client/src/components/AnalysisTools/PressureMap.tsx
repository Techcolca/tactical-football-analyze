import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface PressurePoint {
  x: number;
  y: number;
  intensity: number;
  team: 'home' | 'away';
}

interface PressureMapProps {
  pressurePoints: PressurePoint[];
  width: number;
  height: number;
}

const PressureMap: React.FC<PressureMapProps> = ({ pressurePoints, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || pressurePoints.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Crear gradientes para cada equipo
    const defs = svg.append("defs");
    
    // Gradiente equipo local
    const homeGradient = defs.append("radialGradient")
      .attr("id", "home-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    homeGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FF4500")
      .attr("stop-opacity", 0.8);

    homeGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#FF4500")
      .attr("stop-opacity", 0);

    // Gradiente equipo visitante
    const awayGradient = defs.append("radialGradient")
      .attr("id", "away-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    awayGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4169E1")
      .attr("stop-opacity", 0.8);

    awayGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4169E1")
      .attr("stop-opacity", 0);

    // Crear zonas de presión
    pressurePoints.forEach((point, i) => {
      const radius = point.intensity * 30;
      
      // Círculo principal
      const pressureGroup = svg.append("g")
        .attr("class", "pressure-point")
        .attr("transform", `translate(${point.x * width}, ${point.y * height})`);

      pressureGroup.append("circle")
        .attr("r", radius)
        .attr("fill", `url(#${point.team}-gradient)`)
        .attr("class", "pressure-circle");

      // Anillo pulsante
      const pulseCircle = pressureGroup.append("circle")
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", point.team === 'home' ? "#FF4500" : "#4169E1")
        .attr("stroke-width", 2)
        .attr("opacity", 0.5);

      // Animación del pulso
      pulseCircle.append("animate")
        .attr("attributeName", "r")
        .attr("values", `${radius};${radius * 1.3};${radius}`)
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");

      pulseCircle.append("animate")
        .attr("attributeName", "opacity")
        .attr("values", "0.5;0;0.5")
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");
    });

    // Añadir líneas de conexión entre puntos de presión del mismo equipo
    const homePoints = pressurePoints.filter(p => p.team === 'home');
    const awayPoints = pressurePoints.filter(p => p.team === 'away');

    const drawConnections = (points: PressurePoint[], color: string) => {
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const distance = Math.hypot(
            (points[i].x - points[j].x) * width,
            (points[i].y - points[j].y) * height
          );

          if (distance < width * 0.3) { // Solo conectar puntos cercanos
            svg.append("line")
              .attr("x1", points[i].x * width)
              .attr("y1", points[i].y * height)
              .attr("x2", points[j].x * width)
              .attr("y2", points[j].y * height)
              .attr("stroke", color)
              .attr("stroke-width", 1)
              .attr("stroke-dasharray", "5,5")
              .attr("opacity", 0.3);
          }
        }
      }
    };

    drawConnections(homePoints, "#FF4500");
    drawConnections(awayPoints, "#4169E1");

  }, [pressurePoints, width, height]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute top-0 left-0"
      />
    </motion.div>
  );
};

export default PressureMap;
