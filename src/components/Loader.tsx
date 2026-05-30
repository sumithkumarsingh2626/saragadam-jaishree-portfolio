import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import "./Loader.css";

const Loader = () => {
  const { progress } = useProgress();
  const [loadingComplete, setLoadingComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const name = "SARAGADAM JAISHREE";
  const letters = name.split("");

  useEffect(() => {
    if (!textRef.current) return;

    const spans = textRef.current.children;

    // Jumbled entrance animation for each letter
    gsap.fromTo(
      spans,
      {
        opacity: 0,
        x: () => (Math.random() - 0.5) * 400,
        y: () => (Math.random() - 0.5) * 400,
        rotation: () => (Math.random() - 0.5) * 180,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "power3.out",
      }
    );
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Small delay after reaching 100% to let users see it's done
      const timeout = setTimeout(() => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => setLoadingComplete(true),
          });
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  if (loadingComplete) return null;

  return (
    <div className="loader-container" ref={containerRef}>
      <div className="loader-content">
        <div className="loader-text" ref={textRef}>
          {letters.map((char, index) => (
            <span key={index} className="loader-char">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
        <div className="loader-bar-container">
          <div
            className="loader-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loader-percentage">{Math.round(progress)}%</div>
      </div>
    </div>
  );
};

export default Loader;
