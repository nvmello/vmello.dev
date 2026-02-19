import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

// Create the context
const ColorContext = createContext();

// Define color schemes
const colorSchemes = {
  dark: {
    bg: "bg-[#000000]",
    bgFaded: "bg-[#050505]",
    bgSubtle: "bg-[#030303]",
    textBg: "text-[#000000]",
    gradientColor: "#000000",
    text: "text-[#6b7280]",
    title: "text-[#ffffff]",
    logo: "text-[#FFFFFF]",
    accent: "text-[#00ff00]",
    accentBg: "bg-[#00ff00]/10",
    accentBadge: "bg-[#00ff00]/20 text-[#00ff00]",
    typeBadge: "bg-blue-500/20 text-blue-400",
    accentIcon: "text-[#00ff00]",
    hover: "hover:text-[#00ff00] transition duration-500 ease-in-out",
    bgHover: "bg-[#00ff00]",
    bgAccentHover: "group-hover:bg-[#00ff00]/10",
    border: "border-[#111111]",
    borderHover: "hover:border-[#00ff00]",
    pill: "bg-[#030303] border border-[#111111]",
    pillError: "bg-red-900/80 border border-red-800",
    errorText: "text-red-400",
    techPill: "bg-[#030303] text-gray-400 border border-[#111111]",
    linkBtn: "text-gray-400 hover:text-white border border-[#111111] hover:border-[#333]",
    shadow: "shadow-[#111111]",
    laser:
      "duration-300 absolute inset-0 z-0 scale-125 bg-gradient-to-t from-[#00ff00]/0 from-40% via-[#00ff00]/100 to-[#00ff00]/0 to-60% opacity-0 transition-opacity group-hover:opacity-100",
    hoverShadow:
      "shadow-md hover:shadow-[#00ff00] transition-shadow duration-500 ease-in-out",
    borderAccent: "border-2 border-[#00ff00]",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(0,255,0,0.08)]",
    divider: "from-transparent via-[#00ff00]/20 to-transparent",
    duotonePresets: {
      primary: "#FFFFFF",
      secondary: "#6b7280",
      hoverPrimary: "#00ff00",
      hoverSecondary: "#111111",
    },
  },

  light: {
    bg: "bg-[#F8F9F6]",
    bgFaded: "bg-[#949995]",
    bgSubtle: "bg-white/50",
    textBg: "text-[#F8F9F6]",
    gradientColor: "#F8F9F6",
    text: "text-[#949995]",
    title: "text-[#435D56]",
    logo: "text-[#435D56]",
    accent: "text-[#B8D09A]",
    accentBg: "bg-[#B8D09A]/20",
    accentBadge: "bg-[#B8D09A]/20 text-[#435D56]",
    typeBadge: "bg-blue-100 text-blue-700",
    accentIcon: "text-[#B8D09A]",
    hover: "hover:text-[#B8D09A] transition duration-500 ease-in-out",
    bgHover: "bg-[#B8D09A]",
    bgAccentHover: "group-hover:bg-[#B8D09A]/20",
    border: "border-gray-300",
    borderHover: "hover:border-[#435D56]",
    pill: "bg-gray-100/80 border border-gray-200",
    pillError: "bg-red-100/80 border border-red-200",
    errorText: "text-red-600",
    techPill: "bg-gray-200 text-gray-700",
    linkBtn: "text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400",
    shadow: "shadow-[#949995]",
    laser:
      "duration-300 absolute inset-0 z-0 scale-125 bg-gradient-to-t from-[#B8D09A]/0 from-40% via-[#B8D09A]/100 to-[#B8D09A]/0 to-60% opacity-0 transition-opacity group-hover:opacity-100",
    hoverShadow:
      "shadow-md hover:shadow-[#B8D09A] transition-shadow duration-500 ease-in-out",
    borderAccent: "border-2 border-[#435D56]",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(184,208,154,0.1)]",
    divider: "from-transparent via-[#B8D09A]/20 to-transparent",
    duotonePresets: {
      primary: "#B8D09A",
      secondary: "#435D56",
      hoverPrimary: "#435D56",
      hoverSecondary: "#B8D09A",
    },
  },

  // limited: {
  //   // Using cool teal (#2F9493) as background with light coral (#EECECE) as contrast
  //   bg: "bg-[#7FE5E4]",
  //   bgFaded: "bg-[#EECECE]",
  //   gradientColor: "#7FE5E4",

  //   // Bright red (#FC5352) for text elements
  //   text: "text-[#FC5352]",
  //   title: "text-[#FC5352]",
  //   logo: "text-[#FC5352]",

  //   // Hover states using bright teal (#5FF7F7) for contrast
  //   hover: "hover:text-[#FC5352] transition duration-500 ease-in-out",
  //   bgHover: "hover:bg-[#9E3B3B]",

  //   // Shadows using dark red (#9E3B3B) for depth
  //   shadow: "shadow-[#9E3B3B]",
  //   hoverShadow:
  //     "shadow-md hover:shadow-[#FC5352] transition-shadow duration-500 ease-in-out",

  //   // Duotone effects using the full range
  //   duotonePresets: {
  //     primary: "#FC5352", // Light coral
  //     secondary: "#255352", // Dark red
  //     hoverPrimary: "#255352", // Bright teal
  //     hoverSecondary: "#FC5352", // Bright red
  //   },
  // },
};

// Create the provider component
function ColorProvider({ children }) {
  const [selectedTheme, setSelectedTheme] = useState("dark"); // default theme

  const changeTheme = () => {
    const themes = Object.keys(colorSchemes);
    const currentIndex = themes.indexOf(selectedTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setSelectedTheme(themes[nextIndex]);
  };

  return (
    <ColorContext.Provider
      value={{
        colorScheme: colorSchemes[selectedTheme],
        selectedTheme,
        changeTheme,
        availableThemes: Object.keys(colorSchemes),
      }}
    >
      {children}
    </ColorContext.Provider>
  );
}

ColorProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

// Custom hook to use the context
function useColorContext() {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error("useColorContext must be used within a ColorProvider");
  }
  return context;
}

// Export everything needed
export { ColorProvider, useColorContext };
export default ColorContext;
