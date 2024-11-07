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
        <span className="text-sm whitespace-nowrap mr-8">
          Events: Better Together
        </span>
        <span className="text-sm whitespace-nowrap mr-8">Another one</span>
      </div>
    </Marquee>
  );
}

export default MyMarquee;
