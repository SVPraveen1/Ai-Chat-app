import { Variants } from 'framer-motion';

export const chatSidebarVariants: Variants = {
  closed: { 
    x: '-100%',
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

export const messageVariants: Variants = {
  initial: (i: number) => ({
    opacity: 0,
    y: 20,
    x: i % 2 === 0 ? 20 : -20
  }),
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: -10,
    x: i % 2 === 0 ? 20 : -20,
    transition: {
      duration: 0.2
    }
  })
};

export const typingIndicatorVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

export const messageBubbleVariants = (isUser: boolean) => ({
  initial: { 
    opacity: 0,
    x: isUser ? 20 : -20,
    scale: 0.95 
  },
  animate: { 
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    x: isUser ? 20 : -20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
});
