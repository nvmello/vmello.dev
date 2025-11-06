import { memo, useEffect, useRef, useState } from "react";
import { useColorContext } from "../../context/ColorContext";

/**
 * SmoothMarquee Component
 * Infinite scrolling carousel that NEVER jumps or resets visually
 * Uses requestAnimationFrame + modulo arithmetic for seamless looping
 */
function SmoothMarquee({ children, speed = 25 }) {
  const { colorScheme } = useColorContext();
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(0);
  const isPausedRef = useRef(false);
  const [itemWidth, setItemWidth] = useState(0);

  // Measure the width of one item set
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const firstChild = container.firstElementChild;
    if (!firstChild) return;

    // Force layout recalculation to ensure accurate measurements
    const measureWidth = () => {
      // Force a reflow to get accurate measurements
      void firstChild.offsetHeight;
      // Use scrollWidth for pixel-perfect measurements (no subpixel fractions)
      return firstChild.scrollWidth;
    };

    // Use ResizeObserver to handle dynamic content size changes
    const observer = new ResizeObserver(() => {
      // Debounce rapid resize events
      requestAnimationFrame(() => {
        const width = measureWidth();
        if (width > 0) {
          setItemWidth(width);
        }
      });
    });

    observer.observe(firstChild);

    // Measure after a double rAF to ensure layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const initialWidth = measureWidth();
        if (initialWidth > 0) {
          setItemWidth(initialWidth);
        }
      });
    });

    return () => observer.disconnect();
  }, [children]);

  // Animate the marquee
  useEffect(() => {
    if (!itemWidth) return;

    const container = containerRef.current;
    if (!container) return;

    // Reset position when itemWidth changes to prevent issues
    positionRef.current = 0;

    const pixelsPerFrame = speed / 10;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (!isPausedRef.current) {
        // Increment position based on speed and time elapsed
        positionRef.current += (pixelsPerFrame * deltaTime) / 16.67; // Normalize to 60fps

        // Apply modulo only to the transform, not to the position itself
        // This prevents accumulating floating point errors while keeping smooth animation
        const transformPosition = positionRef.current % itemWidth;

        // Apply transform - continuously moves left
        container.style.transform = `translate3d(-${transformPosition}px, 0, 0)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [itemWidth, speed]);

  // Pause on hover
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleMouseEnter = () => {
      isPausedRef.current = true;
    };

    const handleMouseLeave = () => {
      isPausedRef.current = false;
    };

    wrapper.addEventListener('mouseenter', handleMouseEnter);
    wrapper.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      wrapper.removeEventListener('mouseenter', handleMouseEnter);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-4/6 overflow-hidden">
      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className="h-full w-16 absolute left-0"
          style={{
            background: `linear-gradient(to right, ${colorScheme.gradientColor}, transparent)`,
          }}
        />
        <div
          className="h-full w-16 absolute right-0"
          style={{
            background: `linear-gradient(to left, ${colorScheme.gradientColor}, transparent)`,
          }}
        />
      </div>

      {/* Infinite scrolling belt - 5 identical copies */}
      <div
        ref={containerRef}
        className="flex"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      >
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex shrink-0" aria-hidden={index > 0}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(SmoothMarquee);
