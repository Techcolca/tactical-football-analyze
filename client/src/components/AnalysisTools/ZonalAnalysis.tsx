import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

interface ZoneData {
  x: number;
  y: number;
  possession: number;
  duels: number;
  passes: number;
  team: 'home' | 'away';
}

interface ZonalAnalysisProps {
  zones: ZoneData[];
  width: number;
  height: number;
}

const ZonalAnalysis: React.FC<ZonalAnalysisProps> = ({ zones, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || zones.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Configuración de la cuadrícula
    const gridSize = { x: 6, y: 4 }; // División del campo en zonas
    const cellWidth = width / gridSize.x;
    const cellHeight = height / gridSize.y;

    // Crear la cuadrícula base
    const grid = svg.append("g")
      .attr("class", "grid");

    // Dibujar las zonas
    zones.forEach((zone) => {
      const x = zone.x * width;
      const y = zone.y * height;
      
      const zoneGroup = grid.append("g")
        .attr("transform", `translate(${x}, ${y})`);

      // Rectángulo base de la zona
      zoneGroup.append("rect")
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", zone.team === 'home' ? "#FF450033" : "#4169E133")
        .attr("stroke", "#DAA520")
        .attr("stroke-width", 1);

      // Indicador de posesión
      const possessionHeight = (zone.possession / 100) * cellHeight;
      zoneGroup.append("rect")
        .attr("width", cellWidth * 0.1)
        .attr("height", possessionHeight)
        .attr("x", cellWidth * 0.1)
        .attr("y", cellHeight - possessionHeight)
        .attr("fill", zone.team === 'home' ? "#FF4500" : "#4169E1")
        .attr("opacity", 0.8);

      // Indicador de duelos
      const duelsRadius = (zone.duels / 100) * (cellWidth * 0.2);
      zoneGroup.append("circle")
        .attr("cx", cellWidth * 0.5)
        .attr("cy", cellHeight * 0.5)
        .attr("r", duelsRadius)
        .attr("fill", "#DAA520")
        .attr("opacity", 0.6);

      // Flechas de pases
      if (zone.passes > 0) {
        const arrowSize = (zone.passes / 100) * (cellWidth * 0.3);
        
        // Crear marcador de flecha
        svg.append("defs")
          .append("marker")
          .attr("id", `arrow-${zone.x}-${zone.y}`)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 8)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", zone.team === 'home' ? "#FF4500" : "#4169E1");

        // Dibujar flechas de pases
        zoneGroup.append("line")
          .attr("x1", cellWidth * 0.3)
          .attr("y1", cellHeight * 0.7)
          .attr("x2", cellWidth * 0.7)
          .attr("y2", cellHeight * 0.3)
          .attr("stroke", zone.team === 'home' ? "#FF4500" : "#4169E1")
          .attr("stroke-width", arrowSize)
          .attr("marker-end", `url(#arrow-${zone.x}-${zone.y})`)
          .attr("opacity", 0.6);
      }

      // Añadir tooltips interactivos
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#2C2C2C")
        .style("color", "#DAA520")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px");

      zoneGroup
        .on("mouseover", (event) => {
          tooltip
            .style("visibility", "visible")
            .html(`
              <div class="font-bold">Zona ${zone.x},${zone.y}</div>
              <div>Posesión: ${zone.possession}%</div>
              <div>Duelos: ${zone.duels}</div>
              <div>Pases: ${zone.passes}</div>
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });

      // Animaciones
      zoneGroup.selectAll("rect, circle, line")
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 0.6);
    });

  }, [zones, width, height]);

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

export default ZonalAnalysis;
