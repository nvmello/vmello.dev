import React, { useState } from "react";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";

export const ProfessionalConnect = () => {
  const { colorScheme } = useColorContext();

  const professionalLinks = [
    {
      account: "LinkedIn",
      icon: "fa-brands fa-linkedin",
      link: "https://www.linkedin.com/in/nvmello/",
      description: "Professional Network"
    },
    {
      account: "GitHub",
      icon: "fa-brands fa-github",
      link: "https://github.com/nvmello",
      description: "Code Repository"
    },
    {
      account: "Email",
      icon: "fa-solid fa-envelope",
      link: "mailto:nicholas@vmello.dev",
      description: "Get In Touch"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
      {professionalLinks.map((item, index) => (
        <ProfessionalCard
          key={item.account}
          icon={item.icon}
          link={item.link}
          label={item.account}
          description={item.description}
          index={index}
        />
      ))}
    </div>
  );
};

const ProfessionalCard = ({ icon, link, label, description, index }) => {
  const { colorScheme } = useColorContext();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative p-4 sm:p-8 rounded-lg border-2
        transition-[border-color,box-shadow,transform] duration-300
        hover:scale-105 active:scale-[0.98]
        ${colorScheme.border} ${colorScheme.borderHover}
        ${colorScheme.bg} cursor-pointer
      `}
    >
      <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
        <span
          className={`font-mono text-[10px] tracking-widest ${colorScheme.text} opacity-50 hidden sm:block`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div
          className="p-3 sm:p-4 rounded-full transition-[background-color] duration-300"
          style={{
            backgroundColor: isHovered
              ? (colorScheme.bg === "bg-[#000000]"
                  ? "rgba(0, 255, 0, 0.1)"
                  : "rgba(184, 208, 154, 0.2)")
              : (colorScheme.bg === "bg-[#000000]"
                  ? "#030303"
                  : "rgba(255, 255, 255, 0.5)"),
            color: isHovered
              ? colorScheme.duotonePresets?.hoverPrimary
              : colorScheme.duotonePresets?.primary,
            "--fa-primary-color": isHovered
              ? colorScheme.duotonePresets?.hoverPrimary
              : colorScheme.duotonePresets?.primary,
            "--fa-secondary-color": isHovered
              ? colorScheme.duotonePresets?.hoverSecondary
              : colorScheme.duotonePresets?.secondary,
          }}
        >
          <i className={`${icon} text-xl sm:text-3xl`} />
        </div>

        <div>
          <h3 className={`text-sm sm:text-xl font-semibold mb-1 ${colorScheme.title}`}>
            {label}
          </h3>
          <p className={`text-xs sm:text-sm ${colorScheme.text} hidden sm:block`}>
            {description}
          </p>
        </div>
      </div>
    </a>
  );
};

export default ProfessionalConnect;
