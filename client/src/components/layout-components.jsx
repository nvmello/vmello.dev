import React from "react";
import PropTypes from "prop-types";

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

export const SectionHeader = ({ icon: Icon, title }) => {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-6 ">
      <Icon
        className="text-accent hover:text-accent-hover transition-colors duration-200"
        size={22}
      />
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">{title}</h1>
    </div>
  );
};

SectionHeader.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
};

export const SectionContent = ({ children }) => {
  return (
    <div className="m-10 text-base sm:text-xl md:text-2xl space-y-2 sm:space-y-4 overflow-visible break-words leading-relaxed">
      {children}
    </div>
  );
};

SectionContent.propTypes = {
  children: PropTypes.node.isRequired,
};
