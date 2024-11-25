import React from "react";
import PropTypes from "prop-types";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "./MyIcon";

export const Section = ({ children }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 transition-all duration-300 ease-in-out">
      {children}
    </div>
  );
};

Section.propTypes = {
  children: PropTypes.node.isRequired,
};

export const SectionHeader = ({ icon, title, size = "text-xl", children }) => {
  const { colorScheme } = useColorContext();
  return (
    <div className="w-full">
      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
        <div className={`${colorScheme.title} flex gap-3`}>
          <MyIcon icon={icon} size={size} />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
            {title}
          </h1>
        </div>

        <div className="w-fit">{children}</div>

        <div></div>
      </div>
    </div>
  );
};

SectionHeader.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.string,
  children: PropTypes.node,
};

export const SectionContent = ({ children }) => {
  const { colorScheme } = useColorContext();
  return (
    <div
      className={`${colorScheme.text}  m-10 text-base sm:text-xl md:text-2xl space-y-2 sm:space-y-4 overflow-visible break-words leading-relaxed mx-auto `}
    >
      {children}
    </div>
  );
};

SectionContent.propTypes = {
  children: PropTypes.node.isRequired,
};
