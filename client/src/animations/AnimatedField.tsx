import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import * as THREE from 'three';
import { fieldTransitions } from './transitions';

interface AnimatedFieldProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

const AnimatedField: React.FC<AnimatedFieldProps> = ({ width, height, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuración de Three.js
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Crear el campo de fútbol
    const fieldGeometry = new THREE.PlaneGeometry(width / 100, height / 100);
    const fieldMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#0A2342') },
        color2: { value: new THREE.Color('#2C2C2C') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;

        void main() {
          float pattern = sin(vUv.x * 10.0 + time) * sin(vUv.y * 10.0 + time) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, pattern);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    scene.add(field);

    // Líneas del campo
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xDAA520 });
    
    // Línea central
    const centerLineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -height/200, 0.001),
      new THREE.Vector3(0, height/200, 0.001),
    ]);
    const centerLine = new THREE.Line(centerLineGeometry, lineMaterial);
    scene.add(centerLine);

    // Círculo central
    const circleGeometry = new THREE.CircleGeometry(0.5, 32);
    const circleEdges = new THREE.EdgesGeometry(circleGeometry);
    const circle = new THREE.LineSegments(circleEdges, lineMaterial);
    circle.position.z = 0.001;
    scene.add(circle);

    // Animación
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      time += 0.005;
      if (fieldMaterial.uniforms) {
        fieldMaterial.uniforms.time.value = time;
      }

      field.rotation.x = Math.sin(time * 0.5) * 0.05;
      field.rotation.y = Math.cos(time * 0.3) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // Efectos de hover
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / width) * 2 - 1;
      const y = -((event.clientY - rect.top) / height) * 2 + 1;

      field.rotation.x = y * 0.1;
      field.rotation.y = x * 0.1;
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [width, height]);

  return (
    <motion.div
      ref={containerRef}
      className="relative"
      variants={fieldTransitions}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedField;
