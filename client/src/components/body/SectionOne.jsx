import { useState } from "react";
import { SectionHeader, SectionContent } from "../util/layout-components";
import { useColorContext } from "../../context/ColorContext";
import ResumeModal from "../util/ResumeModal";
import AsuPitchfork from "../util/AsuPitchfork";

const tags = [
  "AI",
  "Full-Stack",
  "Automation",
  "Rock Climbing",
  "Photography",
];

function SectionOne() {
  const { colorScheme } = useColorContext();
  const [resumeOpen, setResumeOpen] = useState(false);

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
          design, communicate, and ship. Most of my focus goes to
          reducing friction and finding better ways to turn intent into
          working systems, so people can spend their attention on what
          actually matters.
        </p>
        <p className="font-light">
          Outside of engineering, I spend time rock climbing, lifting,
          and exploring new places with my camera. I studied Computer
          Science at Arizona State University.
          <AsuPitchfork className="inline-block h-[1.6em] w-[1em] ml-2 align-[-0.38em]" />
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
        <button
          onClick={() => setResumeOpen(true)}
          className={`inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium rounded-md border transition-all duration-300 w-fit ${colorScheme.linkBtn}`}
        >
          <i className="fa-solid fa-arrow-down-to-line text-xs" />
          Resume
        </button>
        <ResumeModal
          isOpen={resumeOpen}
          onClose={() => setResumeOpen(false)}
        />
      </SectionContent>
    </>
  );
}

export default SectionOne;
