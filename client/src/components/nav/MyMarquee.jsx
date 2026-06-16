import { memo } from "react";
import SmoothMarquee from "./SmoothMarquee";
import MusicHistory from "./MusicHistory";
import WorkoutData from "./WorkoutData";

/**
 * MyMarquee Component
 * A scrolling marquee component that displays music history and workout data with custom gradient overlays.
 * Uses CSS-based animation for smooth scrolling that doesn't reset when content updates.
 *
 * Features:
 * - Pauses on hover
 * - Custom gradient overlays that match the app's color scheme
 * - Responsive design optimized for both desktop and mobile
 * - Smooth scrolling animation that persists through content updates
 */
function MyMarquee() {
  return (
    <SmoothMarquee speed={6}>
      {/* Equal one-sided spacing (padding-right) on every item guarantees the
          gap between items and the gap at the loop seam are identical, and
          padding (unlike margin) is counted in scrollWidth so the loop
          distance measures exactly. */}
      <div className="flex items-center pr-8 md:pr-32">
        <MusicHistory />
      </div>
      <div className="flex items-center pr-8 md:pr-32">
        <WorkoutData />
      </div>
    </SmoothMarquee>
  );
}

export default memo(MyMarquee);
