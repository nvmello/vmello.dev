import React from "react";
import PropTypes from "prop-types";

export const ConnectionCard = ({ data }) => {
  const { account, icon, username, subSection, subSectionData, link } = data;
  return (
    <div className="px-4 w-full w-32 mx-auto">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="flex flex-col items-center pb-5 bg-black shadow-md shadow-gray-700 hover:shadow-accent-hover transition-shadow duration-500 ease-in-out rounded-lg">
          <h2 className="text-lg font-bold mt-4">{account}</h2>
          <i className={`${icon} text-5xl my-2`} />
          <p className="text-3xl font-bold">{username}</p>
          <p className="capitalize text-l">{subSection}</p>
          <p className="capitalize text-sm">{subSectionData}</p>
        </div>
      </a>
    </div>
  );
};

export default ConnectionCard;
