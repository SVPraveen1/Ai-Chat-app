import { Variants } from 'framer-motion';

export const aiSidebarVariants: Variants = {
  closed: { 
    x: '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 40
    }
  },
  open: { 
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 40
    }
  }
};

export const menuItemVariants: Variants = {
  closed: { 
    opacity: 0,
    x: 50,
    transition: {
      y: { stiffness: 1000 }
    }
  },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.1 * i,
      y: { stiffness: 1000, velocity: -100 }
    }
  })
};

export const featureCardVariants: Variants = {
  offscreen: {
    y: 50,
    opacity: 0
  },
  onscreen: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.8,
      delay: 0.1 * i
    }
  })
};

export const toggleButtonVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};
