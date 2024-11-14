import { CircleUser } from "lucide-react";
import { SectionHeader, SectionContent } from "./layout-components";

function SectionOne() {
  return (
    <>
      <SectionHeader icon={CircleUser} title="About me" />
      <SectionContent>
        <p className="text-accent">
          Hey there, I'm Nick. My journey into tech began in 2017, when I picked
          up my first book on Python. That spark led me to pursue Computer
          Science at Arizona State University, and today I'm building solutions
          as a software engineer at a Fortune 100 company.
        </p>
        <p className="text-accent">
          Born in the desert, I currently reside in Tucson, Arizona. Outside of
          work, you'll find me hanging at a local cafe, catching some live
          music, or exploring Sonoran trails with my camera. Always ready for an
          adventure.
        </p>
      </SectionContent>
    </>
  );
}

export default SectionOne;
