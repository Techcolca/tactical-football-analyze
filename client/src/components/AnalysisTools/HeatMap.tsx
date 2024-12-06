import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Position {
  x: number;
  y: number;
  intensity: number;
}

interface HeatMapProps {
  positions: Position[];
  width: number;
  height: number;
}

const HeatMap: React.FC<HeatMapProps> = ({ positions, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || positions.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Crear el gradiente
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0A2342")
      .attr("stop-opacity", 0.5);

    gradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#DAA520")
      .attr("stop-opacity", 0.7);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#FF4500")
      .attr("stop-opacity", 0.9);

    // Crear el mapa de calor
    const heatmapData = d3.contourDensity<Position>()
      .x(d => d.x * width)
      .y(d => d.y * height)
      .weight(d => d.intensity)
      .size([width, height])
      .bandwidth(30)
      (positions);

    // Dibujar las áreas de calor
    svg.append("g")
      .attr("class", "heat-areas")
      .selectAll("path")
      .data(heatmapData)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", "url(#heatmap-gradient)")
      .attr("opacity", (d: any) => d.value * 0.8)
      .attr("stroke", "none");

    // Añadir efecto de brillo
    svg.selectAll("path")
      .append("animate")
      .attr("attributeName", "opacity")
      .attr("values", (d: any) => `${d.value * 0.8};${d.value};${d.value * 0.8}`)
      .attr("dur", "3s")
      .attr("repeatCount", "indefinite");

  }, [positions, width, height]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute top-0 left-0 pointer-events-none"
      />
    </div>
  );
};

export default HeatMap;
