import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

// Create the context
const ColorContext = createContext();

// Define color schemes
const colorSchemes = {
  dark: {
    bg: "bg-[#000000]",
    bgFaded: "bg-[#747574]",
    gradientColor: "#000000",
    text: "text-[#747574]",
    title: "text-[#ffffff]",
    logo: "text-[#FFFFFF]",
    hover: "hover:text-[#bed453] transition duration-500 ease-in-out",
    bgHover: "bg-[#bed453]",
    shadow: "shadow-[#747574]",
    hoverShadow:
      "shadow-md hover:shadow-[#bed453] transition-shadow duration-500 ease-in-out",
    borderAccent: "border-2 border-[#ffffff]",
    duotonePresets: {
      primary: "#FFFFFF",
      secondary: "#747574",
      hoverPrimary: "#bed453",
      hoverSecondary: "#747574",
    },
  },

  light: {
    bg: "bg-[#F8F9F6]",
    bgFaded: "bg-[#949995]",
    gradientColor: "#F8F9F6",
    text: "text-[#949995]",
    title: "text-[#435D56]",
    logo: "text-[#435D56]",
    hover: "hover:text-[#B8D09A] transition duration-500 ease-in-out",
    bgHover: "bg-[#B8D09A]",
    shadow: "shadow-[#949995]",
    hoverShadow:
      "shadow-md hover:shadow-[#B8D09A] transition-shadow duration-500 ease-in-out",
    borderAccent: "border-2  border-[#435D56]",
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
