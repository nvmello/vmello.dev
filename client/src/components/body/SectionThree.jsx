import { SectionHeader, SectionContent } from "../util/layout-components";
import { ProfessionalConnect } from "./ProfessionalConnect";

function SectionThree() {
  return (
    <>
      <SectionHeader
        icon="fa-duotone fa-regular fa-chart-network"
        title="Let's Connect"
      >
        {/* <SlideTabsExample /> */}
      </SectionHeader>
      <SectionContent>
        <ProfessionalConnect />
      </SectionContent>
    </>
  );
}

export default SectionThree;
