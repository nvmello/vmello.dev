import { CircleUser } from "lucide-react";
import { SectionHeader, SectionContent } from "./layout-components"; // You'll need to export these

function SectionOne() {
  return (
    <>
      <SectionHeader icon={CircleUser} title="About me" />
      <SectionContent>
        <p className="text-accent">
          Hey there, I'm Nick. My journey into tech began in 2017, when I first
          started experimenting with Python. That spark led me to pursue
          Computer Science at Arizona State University, and today I'm building
          solutions as an engineer at a Fortune 100 company.
        </p>
        <p className="text-accent">
          Born in the desert, I currently reside in Tucson, Arizona. Outside of
          work, you'll find me lifting weights at the gym, hanging out at a
          local cafe, or exploring Sonoran trails with my camera. Always ready
          for an adventure.
        </p>
      </SectionContent>
    </>
  );
}

export default SectionOne;
