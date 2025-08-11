import { SectionHeader, SectionContent } from "../util/layout-components";
import { ProjectsShowcase } from "./ProjectsShowcase";

function SectionTwo() {
  return (
    <>
      <SectionHeader
        icon="fa-duotone fa-solid fa-display-code"
        title="Projects"
      />
      <SectionContent>
        <ProjectsShowcase />
      </SectionContent>
    </>
  );
}

export default SectionTwo;
