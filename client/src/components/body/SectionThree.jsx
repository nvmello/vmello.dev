import { Network } from "lucide-react";
import { SectionHeader, SectionContent } from "../util/layout-components";
import { ConnectionCard } from "../util/ConnectionCard";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { RevealLinks } from "../lootbox/RevealLinks";
import connections from "../../data/Connections.json";
import { motion } from "framer-motion";
import { SlideTabsExample } from "../lootbox/Slidetabs";
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
        <Carousel
          className="flex items-center p-5 "
          responsive={responsive}
          swipeable={true}
          draggable={true}
          touchMove={true}
          // ssr={true} // If you're using server-side rendering
          infinite={true}
          autoPlay={false} // Set to true if you want auto-sliding
          keyBoardControl={true}
          transitionDuration={500}
          removeArrowOnDeviceType={["tablet", "mobile"]}
        >
          <ConnectionCard
            data={connections.accounts.social.instagram}
          ></ConnectionCard>
          <ConnectionCard
            data={connections.accounts.professional.github}
          ></ConnectionCard>
          <ConnectionCard
            data={connections.accounts.professional.linkedin}
          ></ConnectionCard>
          <ConnectionCard
            data={connections.accounts.social.steam}
          ></ConnectionCard>
        </Carousel>
      </SectionContent>
    </>
  );
}

// const steamData = {
//   account: "Steam",
//   icon: "fa-brands fa-steam",
//   // username: "vmello",
//   // subSection: "Some favorites:",
//   // subSectionData: "Valheim, Apex, Elder Scrolls",
//   link: "https://steamcommunity.com/profiles/76561199084454580",
// };

// const instagramData = {
//   account: "Instagram",
//   icon: "fa-brands fa-instagram",
//   // username: "nickvmorello",
//   // subSection: "Some favorites:",
//   // subSectionData: "Valheim, Apex, Elder Scrolls",
//   link: "https://www.instagram.com/nickvmorello/",
// };

// const linkedInData = {
//   account: "LinkedIn",
//   icon: "fa-brands fa-linkedin",
//   // username: "nicholas@vmello.dev",
//   // subSection: "Some favorites:",
//   // subSectionData: "Valheim, Apex, Elder Scrolls",
//   link: "https://www.linkedin.com/in/nvmello/",
// };

// const githubData = {
//   account: "Github",
//   icon: "fa-brands fa-github",

//   link: "https://github.com/nvmello",
// };

// const paypalData = {
//   account: "Paypal",
//   icon: "fa-brands fa-paypal",

//   link: "https://www.paypal.com/paypalme/nvmore",
// };

// const snapchatData = {
//   account: "Snap",
//   icon: "fa-brands fa-snapchat",

//   link: "https://www.snapchat.com/add/nvmello",
// };

export default SectionThree;
