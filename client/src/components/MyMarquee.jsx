import Marquee from "react-fast-marquee";
import Spotify from "./Spotify";
import WorkoutData from "./WorkoutData";
import { useColorContext } from "../context/ColorContext";

function MyMarquee() {
  const { colorScheme } = useColorContext();

  return (
    <div className="w-4/6">
      {" "}
      {/* Wrapper div */}
      <Marquee
        pauseOnHover
        gradient
        gradientColor={colorScheme.gradientColor}
        speed={30}
      >
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
