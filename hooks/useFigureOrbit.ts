"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nearestPose, shortestTurn } from "@/lib/shop/orbit";

const DRAG_DEGREES = 0.85;
const DRAG_START = 6;

/**
 * Drag, flick, wheel, and arrow keys orbit the figure.
 * A flick keeps turning, then eases onto the nearest front, side, or back.
 */
export function useFigureOrbit(enabled: boolean) {
  const [yaw, setYaw] = useState(0);
  const [grabbing, setGrabbing] = useState(false);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  const yawRef = useRef(0);
  const velRef = useRef(0);
  const rafRef = useRef(0);
  const goalRef = useRef<number | null>(null);
  const wheelTimer = useRef(0);
  const dragRef = useRef<{
    x: number;
    moved: boolean;
    startX: number;
    lastT: number;
    pointerId: number;
  } | null>(null);
  const suppressClick = useRef(false);

  const commit = useCallback((value: number) => {
    yawRef.current = value;
    setYaw(value);
  }, []);

  const cancelMotion = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    window.clearTimeout(wheelTimer.current);
  }, []);

  useEffect(() => () => cancelMotion(), [cancelMotion]);

  const easeTo = useCallback(
    (target: number, ms: number) => {
      cancelAnimationFrame(rafRef.current);
      const from = yawRef.current;
      const delta = shortestTurn(from, target);
      const start = performance.now();
      const tick = (now: number) => {
        const u = Math.min(1, (now - start) / ms);
        const eased = 1 - (1 - u) ** 3;
        commit(from + delta * eased);
        if (u < 1) rafRef.current = requestAnimationFrame(tick);
        else goalRef.current = null;
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [commit]
  );

  const settle = useCallback(() => {
    const target = nearestPose(yawRef.current);
    goalRef.current = target;
    easeTo(target, 280);
  }, [easeTo]);

  const coast = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      velRef.current *= 0.9;
      if (Math.abs(velRef.current) < 0.45) {
        settle();
        return;
      }
      commit(yawRef.current + velRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [commit, settle]);

  const nudge = useCallback(
    (direction: -1 | 1) => {
      if (!enabled) return;
      const origin = goalRef.current ?? nearestPose(yawRef.current);
      const target = origin + direction * 90;
      goalRef.current = target;
      easeTo(target, 420);
    },
    [easeTo, enabled]
  );

  const nudgeRef = useRef(nudge);
  nudgeRef.current = nudge;

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabled) return;
    if ((event.target as HTMLElement).closest("[data-orbit-button]")) return;
    cancelMotion();
    goalRef.current = null;
    velRef.current = 0;
    dragRef.current = {
      x: event.clientX,
      moved: false,
      startX: event.clientX,
      lastT: event.timeStamp,
      pointerId: event.pointerId,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.moved && Math.abs(event.clientX - drag.startX) < DRAG_START) return;
    if (!drag.moved) {
      drag.moved = true;
      setGrabbing(true);
      event.currentTarget.setPointerCapture(drag.pointerId);
    }
    const step = event.clientX - drag.x;
    const dt = Math.max(16, event.timeStamp - drag.lastT);
    velRef.current = step * DRAG_DEGREES * (16 / dt);
    drag.x = event.clientX;
    drag.lastT = event.timeStamp;
    commit(yawRef.current + step * DRAG_DEGREES);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setGrabbing(false);
    if (!drag?.moved) return;
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 280);
    if (event.timeStamp - drag.lastT > 48) velRef.current = 0;
    if (Math.abs(velRef.current) < 0.45) settle();
    else coast();
  };

  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.repeat) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      nudgeRef.current(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  useEffect(() => {
    if (!stage || !enabled) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) < 2 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      cancelMotion();
      goalRef.current = null;
      commit(yawRef.current + event.deltaX * 0.4);
      wheelTimer.current = window.setTimeout(() => settle(), 140);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [cancelMotion, commit, enabled, settle, stage]);

  return {
    yaw,
    grabbing,
    setStage,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    nudge,
    suppressClick,
  };
}
