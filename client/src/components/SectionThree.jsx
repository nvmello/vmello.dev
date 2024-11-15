import { Network } from "lucide-react";
import { SectionHeader, SectionContent } from "./layout-components";
import { ConnectionCard } from "./ConnectionCard";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
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
    items: 1,
  },
};

function SectionThree() {
  return (
    <>
      <SectionHeader icon={Network} title="Let's Connect" />
      <SectionContent>
        <Carousel className=" p-5" responsive={responsive}>
          <ConnectionCard data={instagramData}></ConnectionCard>
          <ConnectionCard data={linkedInData}></ConnectionCard>
          <ConnectionCard data={githubData}></ConnectionCard>
          <ConnectionCard data={snapchatData}></ConnectionCard>
          <ConnectionCard data={paypalData}></ConnectionCard>
          <ConnectionCard data={steamData}></ConnectionCard>
        </Carousel>
      </SectionContent>
    </>
  );
}

const steamData = {
  account: "Steam",
  icon: "fa-brands fa-steam",
  // username: "vmello",
  // subSection: "Some favorites:",
  // subSectionData: "Valheim, Apex, Elder Scrolls",
  link: "https://steamcommunity.com/profiles/76561199084454580",
};

const instagramData = {
  account: "Instagram",
  icon: "fa-brands fa-instagram",
  // username: "nickvmorello",
  // subSection: "Some favorites:",
  // subSectionData: "Valheim, Apex, Elder Scrolls",
  link: "https://www.instagram.com/nickvmorello/",
};

const linkedInData = {
  account: "LinkedIn",
  icon: "fa-brands fa-linkedin",
  // username: "nicholas@vmello.dev",
  // subSection: "Some favorites:",
  // subSectionData: "Valheim, Apex, Elder Scrolls",
  link: "https://www.linkedin.com/in/nvmello/",
};

const githubData = {
  account: "Github",
  icon: "fa-brands fa-github",

  link: "https://github.com/nvmello",
};

const paypalData = {
  account: "Paypal",
  icon: "fa-brands fa-paypal",

  link: "https://www.paypal.com/paypalme/nvmore",
};

const snapchatData = {
  account: "Snap",
  icon: "fa-brands fa-snapchat",

  link: "https://www.snapchat.com/add/nvmello",
};

export default SectionThree;
