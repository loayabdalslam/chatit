import React from "react";

interface TypewriterProps {
  text: string;
  speed?: number; // ms per character
  startDelay?: number; // ms before start
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 35, startDelay = 200 }) => {
  const [visibleCount, setVisibleCount] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    const start = setTimeout(() => {
      let i = 0;
      const step = () => {
        if (!mounted) return;
        i += 1;
        setVisibleCount(i);
        if (i < text.length) {
          timeout = window.setTimeout(step, speed);
        }
      };
      step();
    }, startDelay);

    let timeout: number;
    return () => {
      mounted = false;
      clearTimeout(start);
      clearTimeout(timeout);
    };
  }, [text, speed, startDelay]);

  const shown = text.slice(0, visibleCount);

  return (
    <span aria-live="polite">
      {shown}
      <span className="ml-1 inline-block w-0.5 align-middle h-[1em] bg-foreground animate-pulse" aria-hidden="true" />
    </span>
  );
};

export default Typewriter;
