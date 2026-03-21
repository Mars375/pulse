"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Basic visibility hook (backward compatible).
 * Still used by components that just need a boolean.
 */
export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: `top ${100 - threshold * 100}%`,
      onEnter: () => setIsVisible(true),
    });

    return () => st.kill();
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * GSAP scroll reveal — fade in + translateY on scroll into view.
 */
export function useScrollReveal(options?: {
  delay?: number;
  y?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const y = options?.y ?? 40;
    const duration = options?.duration ?? 0.8;
    const delay = options?.delay ?? 0;

    gsap.set(el, { y, opacity: 0 });

    const tween = gsap.to(el, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [options?.delay, options?.y, options?.duration]);

  return ref;
}

/**
 * GSAP stagger reveal — all direct children animate in sequence.
 */
export function useStaggerReveal(stagger = 0.1) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const children = el.children;
    if (!children.length) return;

    gsap.set(children, { y: 30, opacity: 0 });

    const tween = gsap.to(children, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [stagger]);

  return ref;
}
