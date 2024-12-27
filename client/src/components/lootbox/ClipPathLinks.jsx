import React from "react";
import { useAnimate } from "framer-motion";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";
import connectionsData from "../../data/Connections.json";

export const ClipPathLinks = () => {
  const { colorScheme } = useColorContext();

  // Filter active accounts by category
  const professional = Object.values(
    connectionsData.accounts.professional
  ).filter((item) => item.active);
  const socialGaming = Object.values(connectionsData.accounts.social).filter(
    (item) => item.active
  );
  const payments = Object.values(connectionsData.accounts.payments).filter(
    (item) => item.active
  );

  return (
    <div
      className={`divide-y divide-neutral-900 border border-neutral-900 ${colorScheme.bg} ${colorScheme.title}`}
    >
      {/* Professional Row */}
      <div className="grid grid-cols-2 divide-x divide-neutral-900">
        {professional.map((item, index) => (
          <LinkBox
            key={item.account}
            icon={item.icon}
            link={item.link}
            label={item.account}
          />
        ))}
      </div>

      {/* Social/Gaming Row */}
      <div className="grid grid-cols-4 divide-x divide-neutral-900">
        {socialGaming.slice(0, 4).map((item, index) => (
          <LinkBox
            key={item.account}
            icon={item.icon}
            link={item.link}
            label={item.account}
          />
        ))}
      </div>

      {/* Payments Row */}
      {/* <div className="grid grid-cols-3 divide-x divide-neutral-900">
        {payments.slice(0, 3).map((item, index) => (
          <LinkBox
            key={item.account}
            icon={item.icon}
            link={item.link}
            label={item.account}
          />
        ))}
      </div> */}
    </div>
  );
};

const NO_CLIP = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
const BOTTOM_RIGHT_CLIP = "polygon(0 0, 100% 0, 0 0, 0% 100%)";
const TOP_RIGHT_CLIP = "polygon(0 0, 0 100%, 100% 100%, 0% 100%)";
const BOTTOM_LEFT_CLIP = "polygon(100% 100%, 100% 0, 100% 100%, 0 100%)";
const TOP_LEFT_CLIP = "polygon(0 0, 100% 0, 100% 100%, 100% 0)";

const ENTRANCE_KEYFRAMES = {
  left: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  bottom: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  top: [BOTTOM_RIGHT_CLIP, NO_CLIP],
  right: [TOP_LEFT_CLIP, NO_CLIP],
};

const EXIT_KEYFRAMES = {
  left: [NO_CLIP, TOP_RIGHT_CLIP],
  bottom: [NO_CLIP, TOP_RIGHT_CLIP],
  top: [NO_CLIP, TOP_RIGHT_CLIP],
  right: [NO_CLIP, BOTTOM_LEFT_CLIP],
};

const LinkBox = ({ icon, link, label }) => {
  const [scope, animate] = useAnimate();
  const { colorScheme } = useColorContext();

  const getNearestSide = (e) => {
    const box = e.target.getBoundingClientRect();

    const proximityToLeft = {
      proximity: Math.abs(box.left - e.clientX),
      side: "left",
    };
    const proximityToRight = {
      proximity: Math.abs(box.right - e.clientX),
      side: "right",
    };
    const proximityToTop = {
      proximity: Math.abs(box.top - e.clientY),
      side: "top",
    };
    const proximityToBottom = {
      proximity: Math.abs(box.bottom - e.clientY),
      side: "bottom",
    };

    const sortedProximity = [
      proximityToLeft,
      proximityToRight,
      proximityToTop,
      proximityToBottom,
    ].sort((a, b) => a.proximity - b.proximity);

    return sortedProximity[0].side;
  };

  const handleMouseEnter = (e) => {
    const side = getNearestSide(e);
    animate(scope.current, {
      clipPath: ENTRANCE_KEYFRAMES[side],
    });
  };

  const handleMouseLeave = (e) => {
    const side = getNearestSide(e);
    animate(scope.current, {
      clipPath: EXIT_KEYFRAMES[side],
    });
  };

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative grid h-20 w-full place-content-center sm:h-28 md:h-36"
    >
      <MyIcon icon={icon} size="text-xl sm:text-3xl lg:text-4xl" />

      <div
        ref={scope}
        style={{
          clipPath: BOTTOM_RIGHT_CLIP,
        }}
        className={`absolute inset-0 grid place-content-center ${colorScheme.bgHover}`}
      >
        <MyIcon icon={icon} size="text-xl sm:text-3xl md:text-4xl text-black" />
      </div>
    </a>
  );
};

export default ClipPathLinks;
