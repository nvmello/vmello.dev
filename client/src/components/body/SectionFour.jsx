import { Camera } from "lucide-react";
import { SectionHeader, SectionContent } from "../util/layout-components";
import { useColorContext } from "../../context/ColorContext";

function SectionFour() {
  const { colorScheme } = useColorContext();

  return (
    <>
      <SectionHeader
        icon="fa-duotone fa-regular fa-camera"
        title="Photography"
      />
      <SectionContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="">Coming soon</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className={`aspect-square ${colorScheme.bgFaded} rounded-lg`}
            ></div>
            <div
              className={`aspect-square ${colorScheme.bgFaded} rounded-lg`}
            ></div>
            <div
              className={`aspect-square ${colorScheme.bgFaded} rounded-lg`}
            ></div>
            <div
              className={`aspect-square ${colorScheme.bgFaded} rounded-lg`}
            ></div>
          </div>
        </div>
      </SectionContent>
    </>
  );
}

export default SectionFour;
