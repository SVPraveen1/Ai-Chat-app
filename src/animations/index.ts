// Re-export all animation utilities
export * from './landingPageAnimations';
export * from './chatAnimations';
export * from './sidebarAnimations';
export * from './layoutAnimations';
export * from './copilotAnimations';

// Common animation variants that can be reused across components
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'left') => ({
  hidden: {
    x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
    y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
    opacity: 0
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
    y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
});

export const scaleIn = {
  hidden: { 
    opacity: 0,
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0.1) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

// Animation presets
export const animationPresets = {
  fadeIn,
  slideIn,
  scaleIn,
  staggerContainer
};
