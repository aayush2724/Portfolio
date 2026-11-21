"use client";

import { useState, type ReactElement } from "react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "motion/react";
import { cn } from "../../lib/utils";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: { name: string; link: string; icon?: ReactElement }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    const previous = scrollYProgress.getPrevious() ?? current;
    setVisible(current >= 0.05 && current < previous);
  });

  return (
    <motion.nav
      initial={false}
      animate={{ y: visible || reduced ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      aria-hidden={!visible}
      aria-label="Quick navigation"
      className={cn(
        "flex max-w-fit fixed top-10 inset-x-0 mx-auto z-[5000] items-center justify-center",
        !visible && "pointer-events-none",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/80 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur-md dark:border-white/10 dark:bg-black/50">
        <div className="flex items-center gap-1">
          {navItems.map((navItem) => (
            <a
              key={navItem.link}
              href={navItem.link}
              aria-label={navItem.name}
              tabIndex={visible ? undefined : -1}
              className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block">{navItem.name}</span>
            </a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};
