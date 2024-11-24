import React, { useState } from "react";
import PropTypes from "prop-types";
import { useColorContext } from "../../context/ColorContext";

const MyIcon = ({
  icon,
  link = "#",
  size = "text-xl",
  className = "",
  onClick,
  ...props
}) => {
  const { colorScheme } = useColorContext();
  const [isHovered, setIsHovered] = useState(false);

  // Base styles that will be applied to the icon container
  const containerClasses = `
    inline-flex 
    items-center 
    justify-center 
    transition-all 
    duration-300 
    ease-in-out
    ${className}
  `.trim();

  // Icon styles including hover state
  const iconClasses = `
    ${icon} 
    ${size}
    transition-colors 
    duration-300
  `.trim();

  return (
    <a
      href={link}
      className={containerClasses}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        color: isHovered
          ? colorScheme.duotonePresets?.hoverPrimary || "#FFFFFF"
          : colorScheme.duotonePresets?.primary || colorScheme.text,
        "--fa-primary-color": isHovered
          ? colorScheme.duotonePresets?.hoverPrimary
          : colorScheme.duotonePresets?.primary,
        "--fa-secondary-color": isHovered
          ? colorScheme.duotonePresets?.hoverSecondary
          : colorScheme.duotonePresets?.secondary,
      }}
      {...props}
    >
      <i className={iconClasses} />
    </a>
  );
};

MyIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  link: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default MyIcon;
