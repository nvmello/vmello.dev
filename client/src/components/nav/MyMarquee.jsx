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
      <div className="flex items-center ml-4 md:ml-16 lg:ml-20 mr-4 md:mr-16">
        <MusicHistory />
      </div>
      <div className="flex items-center ml-4 md:ml-16 mr-4 md:mr-16">
        <WorkoutData />
      </div>
      <div className="flex items-center ml-4 md:ml-16 mr-4 md:mr-20">
        <div className="w-8"></div>
      </div>
    </SmoothMarquee>
  );
}

export default memo(MyMarquee);
