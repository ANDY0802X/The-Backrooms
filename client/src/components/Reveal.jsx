import React, { useEffect, useRef, useState } from 'react';

/**
 * Reusable Reveal component using IntersectionObserver.
 * Supports an `index` prop for staggered animation delays.
 * Respects prefers-reduced-motion.
 */
export default function Reveal({
  children,
  index = 0,
  delay = 0,
  className = '',
  threshold = 0.1,
  as = 'div',
  ...rest
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [threshold]);

  const staggerDelayMs = Math.max(0, index * 60 + delay);
  const Component = as;

  return (
    <Component
      ref={ref}
      className={`reveal-hidden ${isVisible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={{
        transitionDelay: isVisible ? `${staggerDelayMs}ms` : '0ms'
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
