"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "revolution_visited";

interface UseFirstVisitReturn {
  isFirstVisit: boolean | null;
  isLoading: boolean;
  markAsVisited: () => void;
  resetVisitStatus: () => void;
}

export function useFirstVisit(): UseFirstVisitReturn {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const hasVisited = localStorage.getItem(STORAGE_KEY);
      setIsFirstVisit(!hasVisited);
    } catch {
      setIsFirstVisit(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsVisited = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsFirstVisit(false);
    } catch {
      console.warn("Failed to save visit status to localStorage");
    }
  }, []);

  const resetVisitStatus = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setIsFirstVisit(true);
    } catch {
      console.warn("Failed to reset visit status in localStorage");
    }
  }, []);

  return {
    isFirstVisit,
    isLoading,
    markAsVisited,
    resetVisitStatus,
  };
}
