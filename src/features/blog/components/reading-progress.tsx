import { motion, useSpring } from 'framer-motion';
import { useEffect } from 'react';

import { useReadingProgress } from '@/hooks/use-reading-progress';

export function ReadingProgress() {
  const progress = useReadingProgress();
  const scaleX = useSpring(progress / 100, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    scaleX.set(progress / 100);
  }, [progress, scaleX]);

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
      style={{ scaleX }}
    />
  );
}
