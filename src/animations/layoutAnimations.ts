import { Variants } from 'framer-motion';

export const headerVariants: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  }
};

export const footerVariants: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  }
};

export const navItemVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.1 * i,
      type: 'spring',
      stiffness: 100
    }
  }),
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export const logoVariants = {
  initial: { rotate: 0 },
  hover: {
    rotate: 360,
    transition: { 
      duration: 0.8,
      ease: 'easeInOut'
    }
  }
};

export const socialIconVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.2,
    y: -3,
    transition: { 
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};
