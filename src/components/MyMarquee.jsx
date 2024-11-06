import Marquee from "react-fast-marquee";
import Spotify from "./Spotify";

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
        <h1 className="text-sm whitespace-nowrap">Something else</h1>
        <h1 className="text-sm whitespace-nowrap">Another one</h1>
      </div>
    </Marquee>
  );
}

export default MyMarquee;
