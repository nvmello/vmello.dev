import { SectionHeader, SectionContent } from "../util/layout-components";
import { useColorContext } from "../../context/ColorContext";
import { Example } from "../lootbox/MouseImageTrail";

function SectionFour() {
  const { colorScheme } = useColorContext();

  return (
    <>
      <SectionHeader
        icon="fa-duotone fa-regular fa-camera"
        title="Photography"
      />
      <SectionContent>
        <Example></Example>
      </SectionContent>
    </>
  );
}

export default SectionFour;
