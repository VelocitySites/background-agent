"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseScrollProgressOptions {
  containerRef?: React.RefObject<HTMLElement>;
  sectionSelector?: string;
}

interface UseScrollProgressReturn {
  progress: number;
  currentSection: number;
  totalSections: number;
  scrollToSection: (index: number) => void;
}

export function useScrollProgress(
  options: UseScrollProgressOptions = {}
): UseScrollProgressReturn {
  const { containerRef, sectionSelector = "[data-section]" } = options;

  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const rafRef = useRef<number | null>(null);

  const calculateProgress = useCallback(() => {
    const container = containerRef?.current || document.documentElement;
    const scrollTop = containerRef?.current
      ? containerRef.current.scrollTop
      : window.scrollY;

    const scrollHeight = containerRef?.current
      ? containerRef.current.scrollHeight - containerRef.current.clientHeight
      : document.body.scrollHeight - window.innerHeight;

    const newProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    setProgress(Math.min(1, Math.max(0, newProgress)));

    const sections = document.querySelectorAll(sectionSelector);
    setTotalSections(sections.length);

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      const viewportMiddle = window.innerHeight / 2;
      if (rect.top <= viewportMiddle && rect.bottom >= viewportMiddle) {
        setCurrentSection(index);
      }
    });
  }, [containerRef, sectionSelector]);

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(calculateProgress);
  }, [calculateProgress]);

  const scrollToSection = useCallback(
    (index: number) => {
      const sections = document.querySelectorAll(sectionSelector);
      const section = sections[index];
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    },
    [sectionSelector]
  );

  useEffect(() => {
    const target = containerRef?.current || window;
    target.addEventListener("scroll", handleScroll, { passive: true });
    calculateProgress();

    return () => {
      target.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [containerRef, handleScroll, calculateProgress]);

  return { progress, currentSection, totalSections, scrollToSection };
}
