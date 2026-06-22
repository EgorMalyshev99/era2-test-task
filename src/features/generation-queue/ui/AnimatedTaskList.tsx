import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import type { ReactNode } from 'react'

interface AnimatedTaskItemProps {
  id: string
  children: ReactNode
}

export function AnimatedTaskList({ children }: { children: ReactNode }) {
  return <AnimatePresence initial={false}>{children}</AnimatePresence>
}

export function AnimatedTaskItem({ id, children }: AnimatedTaskItemProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      key={id}
      layout={!reducedMotion}
      initial={reducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
    >
      {children}
    </motion.div>
  )
}
