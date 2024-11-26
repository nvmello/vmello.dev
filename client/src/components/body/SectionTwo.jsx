import { SectionHeader, SectionContent } from "../util/layout-components";
import EncryptWrapper from "../lootbox/EncryptAnimate"; // Changed to default import

function SectionTwo() {
  return (
    <>
      <SectionHeader
        icon="fa-duotone fa-solid fa-display-code"
        title="Projects"
      />
      <SectionContent>
        <EncryptWrapper />
      </SectionContent>
    </>
  );
}

export default SectionTwo;
