import React from "react";
import { useAnimate } from "framer-motion";
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
  const [scope, animate] = useAnimate();
  const { colorScheme } = useColorContext();

  const handleMouseEnter = () => {
    animate(scope.current, {
      scale: 1.05,
      transition: { duration: 0.2 }
    });
  };

  const handleMouseLeave = () => {
    animate(scope.current, {
      scale: 1,
      transition: { duration: 0.2 }
    });
  };

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      ref={scope}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative p-4 sm:p-8 rounded-lg border-2 transition-all duration-300
        ${colorScheme.border} ${colorScheme.borderHover}
        ${colorScheme.bg} group cursor-pointer
      `}
    >
      <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
        <span
          className={`font-mono text-[10px] tracking-widest ${colorScheme.text} opacity-50 hidden sm:block`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className={`
          p-3 sm:p-4 rounded-full transition-all duration-300
          ${colorScheme.bgSubtle} ${colorScheme.bgAccentHover}
        `}>
          <MyIcon
            icon={icon}
            size="text-xl sm:text-3xl"
          />
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
