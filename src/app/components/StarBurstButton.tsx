'use client';

import Link from "next/link";
import { useState } from "react";

interface StarBurstButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function StarBurstButton({ href, children, className = "" }: StarBurstButtonProps) {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Generate 8-12 random stars
    const starCount = Math.floor(Math.random() * 5) + 8;
    const newStars = Array.from({ length: starCount }, (_, i) => ({
      id: Math.random(),
      x: centerX,
      y: centerY,
    }));

    setStars(newStars);

    // Remove stars after animation completes
    setTimeout(() => {
      setStars([]);
    }, 600);
  };

  return (
    <>
      <Link
        href={href}
        className={className}
        onMouseEnter={handleMouseEnter}
      >
        {children}
      </Link>

      {/* Star burst container */}
      {stars.map((star) => {
        const angle = (Math.random() * Math.PI * 2);
        const distance = 80 + Math.random() * 40;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        const duration = 0.5 + Math.random() * 0.2;

        return (
          <div
            key={star.id}
            className="fixed pointer-events-none text-lg"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              animation: `starBurst ${duration}s ease-out forwards`,
              "--end-x": `${endX}px`,
              "--end-y": `${endY}px`,
            } as React.CSSProperties & { "--end-x": string; "--end-y": string }}
          >
            ✨
          </div>
        );
      })}
    </>
  );
}
