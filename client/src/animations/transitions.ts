import { Variants } from 'framer-motion';

// Transiciones FIFA-style para elementos de la interfaz
export const fifaCardVariants: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
    rotateY: -180,
  },
  animate: {
    scale: 1,
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.01, -0.05, 0.95],
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    rotateY: 180,
    transition: {
      duration: 0.6,
    },
  },
  hover: {
    scale: 1.05,
    rotateY: 15,
    transition: {
      duration: 0.3,
    },
  },
};

// Efectos de brillo y resplandor
export const glowEffectVariants: Variants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: [0, 1, 0.8],
    filter: ['blur(10px)', 'blur(2px)', 'blur(4px)'],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

// Animaciones para el campo de fútbol
export const fieldTransitions = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.5,
    },
  },
};

// Animaciones para líneas tácticas
export const tacticalLineVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 1.5,
        ease: 'easeInOut',
      },
      opacity: {
        duration: 0.5,
      },
    },
  },
};

// Efectos de partículas para eventos importantes
export const particleEffectVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 1,
  },
  animate: {
    scale: [0, 1.5, 0],
    opacity: [1, 0.8, 0],
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  },
};

// Transiciones de menú y paneles
export const panelTransitionVariants: Variants = {
  initial: {
    x: -100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Efectos de selección y hover
export const selectionEffectVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0px 0px 0px rgba(218, 165, 32, 0)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0px 0px 20px rgba(218, 165, 32, 0.5)',
    transition: {
      duration: 0.3,
    },
  },
  tap: {
    scale: 0.98,
    boxShadow: '0px 0px 10px rgba(218, 165, 32, 0.3)',
  },
};
