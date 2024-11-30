import Marquee from "react-fast-marquee";
import Spotify from "./Spotify";
import WorkoutData from "./WorkoutData";
import { useColorContext } from "../../context/ColorContext";

/**
 * MyMarquee Component
 * A scrolling marquee component that displays Spotify and workout data with custom gradient overlays.
 * Uses react-fast-marquee for smooth scrolling and custom gradients for better mobile responsiveness.
 *
 * Features:
 * - Pauses on hover
 * - Custom gradient overlays that match the app's color scheme
 * - Responsive design optimized for both desktop and mobile
 * - Smooth scrolling animation
 */
function MyMarquee() {
  // Access the color scheme from the context for gradient styling
  const { colorScheme } = useColorContext();

  return (
    // Main container with relative positioning for gradient overlay placement
    <div className="relative w-4/6">
      {/* Gradient overlay container
          - Uses absolute positioning to place gradients over the marquee
          - pointer-events-none prevents interference with marquee interaction
          - z-10 ensures gradients appear above the scrolling content */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Left gradient overlay
            - Fades from the app's color scheme to transparent
            - w-16 provides a narrow, mobile-friendly gradient width */}
        <div
          className="h-full w-16 absolute left-0"
          style={{
            background: `linear-gradient(to right, ${colorScheme.gradientColor}, transparent)`,
          }}
        />
        {/* Right gradient overlay
            - Mirrors the left gradient
            - Creates symmetrical fade effect */}
        <div
          className="h-full w-16 absolute right-0"
          style={{
            background: `linear-gradient(to left, ${colorScheme.gradientColor}, transparent)`,
          }}
        />
      </div>

      {/* Marquee component
          - gradient={false} disables default gradients in favor of our custom ones
          - speed={30} sets a comfortable scrolling pace
          - pauseOnHover improves user experience by allowing content inspection */}
      <Marquee pauseOnHover gradient={false} speed={30}>
        {/* Content containers with consistent spacing
            - space-x-40 provides generous spacing between items
            - ml-20 mr-20 adds margin to prevent content from touching gradients */}
        <div className="flex items-center space-x-40 ml-20 mr-20">
          <Spotify />
        </div>
        <div className="flex items-center space-x-40 ml-20 mr-20">
          <WorkoutData />
        </div>
      </Marquee>
    </div>
  );
}

export default MyMarquee;
