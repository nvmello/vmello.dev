import Marquee from "react-fast-marquee";
import Spotify from "./Spotify";
import WorkoutData from "./WorkoutData";

function MyMarquee() {
  return (
    <Marquee
      className="w-4/6 h-16 flex items-center overflow-hidden"
      pauseOnHover
      gradient
      gradientColor="black"
      speed={30}
    >
      <div className="flex items-center space-x-20">
        <Spotify />
        <WorkoutData />
      </div>
    </Marquee>
  );
}

export default MyMarquee;
