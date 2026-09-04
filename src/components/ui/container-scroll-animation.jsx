"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useLowPower } from "../../context/motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const lowPower = useLowPower();

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], lowPower ? [0.9, 1] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={lowPower ? undefined : { perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} lowPower={lowPower} />
        <Card rotate={rotate} translate={translate} scale={scale} lowPower={lowPower}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent, lowPower }) => {
  return (
    <motion.div
      style={lowPower ? undefined : { translateY: translate }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  lowPower,
  children,
}) => {
  // A scroll-linked rotateX on a surface that also carries two stacked
  // backdrop-filters forces the compositor to re-blur everything behind the
  // card every frame. Phones get a flat, opaque card instead.
  return (
    <motion.div
      style={
        lowPower
          ? { boxShadow: "0 20px 40px #00000055" }
          : {
              rotateX: rotate,
              scale,
              boxShadow:
                "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
            }
      }
      className={
        "max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C]/50 p-2 md:p-6 rounded-[30px] shadow-2xl " +
        (lowPower ? "bg-[#1a1a1d]" : "bg-white/5 dark:bg-[#222222]/30 backdrop-blur-xl")
      }
    >
      <div
        className={
          "h-full w-full rounded-2xl md:rounded-2xl md:p-4 border border-white/10 relative " +
          (lowPower ? "bg-[#141417]" : "bg-gray-100/50 dark:bg-zinc-900/50 backdrop-blur-md")
        }
      >
        {children}
      </div>
    </motion.div>
  );
};
