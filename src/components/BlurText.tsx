
import { motion } from 'motion/react';

export function SlideUpLine({ children, delay = 0, duration = 0.7 }: any) {
  return (
    <span className="overflow-hidden inline-block">
      <motion.span
        className="inline-block"
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function WordByWordReveal({ text, baseDelay = 0, stagger = 0.035, duration = 0.55, className }: any) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word: string, i: number) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.27em]">
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration, delay: baseDelay + i * stagger, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function BlurReveal({ children, delay = 0, duration = 0.9, className }: any) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
