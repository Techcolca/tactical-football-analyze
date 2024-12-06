import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface FieldProps {
  onPositionClick: (x: number, y: number) => void;
}

const Field: React.FC<FieldProps> = ({ onPositionClick }) => {
  const fieldRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (fieldRef.current) {
      // Animación inicial del campo
      gsap.from(fieldRef.current.children, {
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.inOut"
      });
    }
  }, []);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onPositionClick(x, y);
    }
  };

  return (
    <svg
      ref={fieldRef}
      className="w-full h-full"
      viewBox="0 0 100 100"
      onClick={handleClick}
    >
      {/* Campo principal */}
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="#0A2342"
        stroke="#DAA520"
        strokeWidth="0.5"
      />

      {/* Línea central */}
      <line
        x1="50"
        y1="0"
        x2="50"
        y2="100"
        stroke="#DAA520"
        strokeWidth="0.3"
      />

      {/* Círculo central */}
      <circle
        cx="50"
        cy="50"
        r="10"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />

      {/* Áreas de penalti */}
      {/* Área izquierda */}
      <rect
        x="0"
        y="30"
        width="16"
        height="40"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />
      <rect
        x="0"
        y="35"
        width="5"
        height="30"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />

      {/* Área derecha */}
      <rect
        x="84"
        y="30"
        width="16"
        height="40"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />
      <rect
        x="95"
        y="35"
        width="5"
        height="30"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />

      {/* Puntos de penalti */}
      <circle cx="11" cy="50" r="0.5" fill="#DAA520" />
      <circle cx="89" cy="50" r="0.5" fill="#DAA520" />

      {/* Esquinas */}
      <path
        d="M 0,0 A 3,3 0 0,1 3,3"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />
      <path
        d="M 100,0 A 3,3 0 0,0 97,3"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />
      <path
        d="M 0,100 A 3,3 0 0,0 3,97"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />
      <path
        d="M 100,100 A 3,3 0 0,1 97,97"
        fill="none"
        stroke="#DAA520"
        strokeWidth="0.3"
      />
    </svg>
  );
};

export default Field;
