import { CircleUser } from "lucide-react";
import { SectionHeader, SectionContent } from "../util/layout-components";

function SectionOne() {
  return (
    <>
      <SectionHeader icon="fa-duotone fa-solid fa-user" title="About me" />
      <SectionContent>
        <p>
          Hey there, I'm Nick. My journey into tech began in 2017 when I picked
          up my first book on Python. That spark led me to pursue Computer
          Science at Arizona State University, and today I'm building solutions
          as a software engineer at a Fortune 100 company.
        </p>
        <p>
          Born in the desert, I currently reside in Tucson, Arizona. Outside of
          work, you'll find me hanging at a local cafe, lifting weights, or
          exploring Sonoran trails with my camera. Always up for an adventure.
        </p>
      </SectionContent>
    </>
  );
}

export default SectionOne;
