"use client";

import { useEffect, useRef } from "react";

export default function ClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/button-click.mp3");
    audioRef.current.volume = 0.5;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.closest("a, button, select, [role='button'], input[type='submit'], input[type='button'], label[for], .cursor-pointer") !== null;

      if (isClickable) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
