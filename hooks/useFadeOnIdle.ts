"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseFadeOnIdleOptions {
  timeout?: number;
  initiallyVisible?: boolean;
  minOpacity?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

interface UseFadeOnIdleReturn {
  isVisible: boolean;
  opacity: number;
  show: () => void;
  hide: () => void;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseMove: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onTouchStart: () => void;
  };
}

export function useFadeOnIdle(
  options: UseFadeOnIdleOptions = {}
): UseFadeOnIdleReturn {
  const {
    timeout = 3000,
    initiallyVisible = true,
    minOpacity = 0.3,
    fadeInDuration = 200,
    fadeOutDuration = 800,
  } = options;

  const [isVisible, setIsVisible] = useState(initiallyVisible);
  const [opacity, setOpacity] = useState(initiallyVisible ? 1 : minOpacity);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetOpacityRef = useRef(initiallyVisible ? 1 : minOpacity);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  const smoothFadeTo = useCallback(
    (target: number, duration: number) => {
      clearAllTimers();
      targetOpacityRef.current = target;

      const steps = Math.ceil(duration / 16);
      const opacityDiff = target - opacity;
      const opacityStep = opacityDiff / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const newOpacity = opacity + opacityDiff * easeProgress;

        setOpacity(Math.max(minOpacity, Math.min(1, newOpacity)));

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          setOpacity(target);
          if (target <= minOpacity) {
            setIsVisible(false);
          }
        }
      }, 16);
    },
    [opacity, minOpacity, clearAllTimers]
  );

  const startFadeTimeout = useCallback(() => {
    clearAllTimers();
    timeoutRef.current = setTimeout(() => {
      if (!isInteractingRef.current) {
        smoothFadeTo(minOpacity, fadeOutDuration);
      }
    }, timeout);
  }, [timeout, minOpacity, fadeOutDuration, smoothFadeTo, clearAllTimers]);

  const show = useCallback(() => {
    clearAllTimers();
    setIsVisible(true);
    smoothFadeTo(1, fadeInDuration);
    startFadeTimeout();
  }, [fadeInDuration, smoothFadeTo, startFadeTimeout, clearAllTimers]);

  const hide = useCallback(() => {
    clearAllTimers();
    smoothFadeTo(minOpacity, fadeOutDuration);
  }, [minOpacity, fadeOutDuration, smoothFadeTo, clearAllTimers]);

  const handleInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
    clearAllTimers();
    setIsVisible(true);
    if (opacity < 1) {
      smoothFadeTo(1, fadeInDuration);
    } else {
      setOpacity(1);
    }
  }, [opacity, fadeInDuration, smoothFadeTo, clearAllTimers]);

  const handleInteractionEnd = useCallback(() => {
    isInteractingRef.current = false;
    startFadeTimeout();
  }, [startFadeTimeout]);

  const handleMouseMove = useCallback(() => {
    if (!isInteractingRef.current) {
      if (opacity < 1) {
        setIsVisible(true);
        smoothFadeTo(1, fadeInDuration);
      }
      startFadeTimeout();
    }
  }, [opacity, fadeInDuration, smoothFadeTo, startFadeTimeout]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  useEffect(() => {
    if (initiallyVisible) {
      startFadeTimeout();
    }
  }, []);

  return {
    isVisible,
    opacity,
    show,
    hide,
    handlers: {
      onMouseEnter: handleInteractionStart,
      onMouseLeave: handleInteractionEnd,
      onMouseMove: handleMouseMove,
      onFocus: handleInteractionStart,
      onBlur: handleInteractionEnd,
      onTouchStart: handleInteractionStart,
    },
  };
}
