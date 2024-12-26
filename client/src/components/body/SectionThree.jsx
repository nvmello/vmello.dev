import { SectionHeader, SectionContent } from "../util/layout-components";

import { ClipPathLinks } from "../lootbox/ClipPathLinks";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 3,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 2,
  },
};

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
        {/* <RevealLinks></RevealLinks> */}
        <ClipPathLinks></ClipPathLinks>
      </SectionContent>
    </>
  );
}

export default SectionThree;
