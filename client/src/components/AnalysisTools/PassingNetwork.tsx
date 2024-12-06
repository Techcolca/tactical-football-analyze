import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface Pass {
  from: { x: number; y: number; player: string };
  to: { x: number; y: number; player: string };
  success: boolean;
  timestamp: number;
}

interface PassingNetworkProps {
  passes: Pass[];
  width: number;
  height: number;
}

const PassingNetwork: React.FC<PassingNetworkProps> = ({ passes, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || passes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Crear grupos para líneas y nodos
    const linesGroup = svg.append("g").attr("class", "lines");
    const nodesGroup = svg.append("g").attr("class", "nodes");

    // Procesar datos para el network
    const players = new Set<string>();
    const connections: { [key: string]: number } = {};
    
    passes.forEach(pass => {
      players.add(pass.from.player);
      players.add(pass.to.player);
      
      const key = `${pass.from.player}-${pass.to.player}`;
      connections[key] = (connections[key] || 0) + 1;
    });

    // Crear las líneas de pases
    Object.entries(connections).forEach(([key, value]) => {
      const [from, to] = key.split('-');
      const fromPass = passes.find(p => p.from.player === from)?.from;
      const toPass = passes.find(p => p.to.player === to)?.to;

      if (fromPass && toPass) {
        linesGroup
          .append("line")
          .attr("x1", fromPass.x * width)
          .attr("y1", fromPass.y * height)
          .attr("x2", toPass.x * width)
          .attr("y2", toPass.y * height)
          .attr("stroke", "#DAA520")
          .attr("stroke-width", Math.log(value + 1) * 2)
          .attr("opacity", 0.6)
          .attr("marker-end", "url(#arrow)");
      }
    });

    // Crear los nodos (jugadores)
    Array.from(players).forEach(player => {
      const playerPasses = passes.filter(
        p => p.from.player === player || p.to.player === player
      );
      const avgX = d3.mean(playerPasses, p => 
        p.from.player === player ? p.from.x : p.to.x
      )! * width;
      const avgY = d3.mean(playerPasses, p => 
        p.from.player === player ? p.from.y : p.to.y
      )! * height;

      // Círculo del jugador
      nodesGroup
        .append("circle")
        .attr("cx", avgX)
        .attr("cy", avgY)
        .attr("r", 15)
        .attr("fill", "#0A2342")
        .attr("stroke", "#DAA520")
        .attr("stroke-width", 2);

      // Número del jugador
      nodesGroup
        .append("text")
        .attr("x", avgX)
        .attr("y", avgY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#DAA520")
        .attr("font-size", "12px")
        .text(player);
    });

    // Añadir flechas para las líneas de pase
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#DAA520");

    // Animación de flujo en las líneas
    svg.selectAll("line")
      .append("animate")
      .attr("attributeName", "stroke-dashoffset")
      .attr("values", "0;-20")
      .attr("dur", "1.5s")
      .attr("repeatCount", "indefinite");

  }, [passes, width, height]);

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

export default PassingNetwork;
