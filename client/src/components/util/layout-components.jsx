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

export const SectionHeader = ({ icon: icon, title, size = "text-xl" }) => {
  const { colorScheme } = useColorContext();
  return (
    <div
      className={`${colorScheme.title} flex items-center gap-3 mb-4 sm:mb-6 `}
    >
      <MyIcon icon={icon} size={size} />
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">{title}</h1>
    </div>
  );
};

SectionHeader.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.string,
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
