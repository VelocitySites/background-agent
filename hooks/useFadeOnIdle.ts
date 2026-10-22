"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseFadeOnIdleOptions {
  timeout?: number;
  initiallyVisible?: boolean;
}

interface UseFadeOnIdleReturn {
  isVisible: boolean;
  opacity: number;
  show: () => void;
  hide: () => void;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export function useFadeOnIdle(
  options: UseFadeOnIdleOptions = {}
): UseFadeOnIdleReturn {
  const { timeout = 2000, initiallyVisible = false } = options;

  const [isVisible, setIsVisible] = useState(initiallyVisible);
  const [opacity, setOpacity] = useState(initiallyVisible ? 1 : 0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  const clearFadeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startFadeTimeout = useCallback(() => {
    clearFadeTimeout();
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setOpacity(0);
        setTimeout(() => setIsVisible(false), 300);
      }
    }, timeout);
  }, [timeout, clearFadeTimeout]);

  const show = useCallback(() => {
    setIsVisible(true);
    setOpacity(1);
    startFadeTimeout();
  }, [startFadeTimeout]);

  const hide = useCallback(() => {
    clearFadeTimeout();
    setOpacity(0);
    setTimeout(() => setIsVisible(false), 300);
  }, [clearFadeTimeout]);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    clearFadeTimeout();
    setIsVisible(true);
    setOpacity(1);
  }, [clearFadeTimeout]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    startFadeTimeout();
  }, [startFadeTimeout]);

  const handleFocus = useCallback(() => {
    handleMouseEnter();
  }, [handleMouseEnter]);

  const handleBlur = useCallback(() => {
    handleMouseLeave();
  }, [handleMouseLeave]);

  useEffect(() => {
    return () => clearFadeTimeout();
  }, [clearFadeTimeout]);

  return {
    isVisible,
    opacity,
    show,
    hide,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}
