import React from "react";
import PropTypes from "prop-types";
import { useColorContext } from "../../context/ColorContext";

export const ConnectionCard = ({ data }) => {
  const { account, icon, username, subSection, subSectionData, link } = data;
  const { colorScheme } = useColorContext();

  return (
    <div className="px-4 w-full w-32 mx-auto">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full ${colorScheme.title} ${colorScheme.hover}`}
        style={{ textDecoration: "none" }}
      >
        <div
          className={`flex flex-col items-center pb-5  ${colorScheme.shadow}  ${colorScheme.hoverShadow} rounded-lg`}
        >
          <h2 className={`text-lg font-bold mt-4 `}>{account}</h2>
          <i className={`${icon}  text-5xl my-2`} />
          <p className={`text-3xl font-bold `}>{username}</p>
          <p className={`capitalize text-l `}>{subSection}</p>
          <p className={`capitalize text-sm `}>{subSectionData}</p>
        </div>
      </a>
    </div>
  );
};

ConnectionCard.propTypes = {
  data: PropTypes.shape({
    account: PropTypes.string,
    icon: PropTypes.string,
    username: PropTypes.string,
    subSection: PropTypes.string,
    subSectionData: PropTypes.string,
    link: PropTypes.string,
  }),
};

export default ConnectionCard;
