import { CircleUser } from "lucide-react";

function SectionOne() {
  return (
    <div>
      <div className="flex items-center gap-4 p-4">
        <CircleUser className="text-accent hover:text-accent-hover" size={22} />
        <h1 className="text-xl">About me</h1>
      </div>
      <p className="m-10 text-4xl indent-20">
        Hey there, I'm Nick. My journey into tech began in 2017, when I first
        started experimenting with Python. That spark led me to pursue Computer
        Science at Arizona State University, and today I'm building solutions as
        an engineer at a Fortune 100 company.
      </p>
      <p className="m-10  text-4xl indent-20">
        Born in the desert, I currently reside in Tucson, Arizona. Outside of
        work, you'll find me lifting weights at the gym, hanging out at a local
        cafe, or exploring Sonoran trails with my camera. Always ready for an
        adventure.
      </p>
    </div>
  );
}

export default SectionOne;
