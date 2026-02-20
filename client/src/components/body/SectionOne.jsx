import { SectionHeader, SectionContent } from "../util/layout-components";
import { useColorContext } from "../../context/ColorContext";

const tags = [
  "AI",
  "Full-Stack",
  "Automation",
  "Rock Climbing",
  "Photography",
];

function SectionOne() {
  const { colorScheme } = useColorContext();

  return (
    <>
      <SectionHeader icon="fa-duotone fa-solid fa-user" title="About me" />
      <SectionContent>
        <p className={`${colorScheme.title} text-lg sm:text-xl font-medium leading-relaxed`}>
          I'm Nick. A software engineer focused on turning ideas into
          real products.
        </p>
        <p>
          I'm particularly interested in how AI is changing the way we
          design, communicate, and ship. A lot of my focus is on
          reducing friction, improving how work flows, and finding
          better ways to turn intent into working systems.
        </p>
        <p className="font-light">
          I'm motivated by building systems that save time, reduce
          complexity, and help people focus on what actually matters.
        </p>
        <p className="font-light">
          Outside of engineering, I spend time rock climbing, lifting,
          and exploring new places with my camera. I studied Computer
          Science at Arizona State University.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 text-xs rounded-md font-medium font-mono ${colorScheme.techPill}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </SectionContent>
    </>
  );
}

export default SectionOne;
