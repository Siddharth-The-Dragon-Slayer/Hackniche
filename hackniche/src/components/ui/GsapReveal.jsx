'use client';
import { useEffect, useRef } from 'react';

/**
 * GsapReveal — GSAP ScrollTrigger reveal animation wrapper
 *
 * animation: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'stagger'
 * stagger: number — delay between children (for 'stagger' type)
 */
export default function GsapReveal({
  children,
  animation = 'fadeUp',
  stagger = 0.1,
  duration = 0.8,
  delay = 0,
  ease = 'power3.out',
  className = '',
  style = {},
  once = true,
  start = 'top 88%',
}) {
  const ref = useRef(null);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const el = ref.current;
      if (!el) return;

      ctx = gsap.context(() => {
        const targets = animation === 'stagger'
          ? Array.from(el.children)
          : [el];

        const animations = {
          fadeUp: { from: { opacity: 0, y: 44, filter: 'blur(5px)' }, to: { opacity: 1, y: 0, filter: 'blur(0px)' } },
          fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
          slideLeft: { from: { opacity: 0, x: -56 }, to: { opacity: 1, x: 0 } },
          slideRight: { from: { opacity: 0, x: 56 }, to: { opacity: 1, x: 0 } },
          scaleIn: { from: { opacity: 0, scale: 0.88 }, to: { opacity: 1, scale: 1 } },
          stagger: { from: { opacity: 0, y: 36, filter: 'blur(4px)' }, to: { opacity: 1, y: 0, filter: 'blur(0px)' } },
        };

        const { from, to } = animations[animation] || animations.fadeUp;

        gsap.fromTo(
          targets,
          from,
          {
            ...to,
            duration,
            delay,
            ease,
            stagger: animation === 'stagger' ? stagger : 0,
            scrollTrigger: {
              trigger: el,
              start,
              once,
              toggleActions: once ? 'play none none none' : 'play reverse play reverse',
            },
          }
        );
      }, el);
    })();

    return () => ctx?.revert();
  }, [animation, stagger, duration, delay, ease, once, start]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
