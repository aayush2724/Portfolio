import { useEffect, useRef } from "react";
export default function CustomCursor() {
  const dot = useRef(null);
  useEffect(() => {
    let mx = 0,
      my = 0;
    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    };
    const enter = () => dot.current.classList.add("active");
    const leave = () => dot.current.classList.remove("active");
    document.addEventListener("mousemove", move, { passive: true });
    document.querySelectorAll("a,button").forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    return () => {
      document.removeEventListener("mousemove", move);
    };
  }, []);
  return <div ref={dot} className="cursor" />;
}
