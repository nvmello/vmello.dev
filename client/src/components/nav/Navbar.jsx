import { useState } from "react";
import MyMarquee from "./MyMarquee";
import NvmLogo from "./NvmLogo";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { colorScheme, changeTheme } = useColorContext();
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav
      className={`${colorScheme.bg} fixed z-50 w-full top-0 left-0 shadow-md`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div
              className={`${colorScheme.logo} ${colorScheme.hover}`}
              onClick={changeTheme}
            >
              <NvmLogo className="h-14 w-14" />
            </div>
          </div>
          <MyMarquee />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <MyIcon icon="fa-duotone fa-solid fa-user" />
            <MyIcon icon="fa-duotone fa-solid fa-display-code" />
            <MyIcon icon="fa-duotone fa-regular fa-camera" />
            <MyIcon icon="fa-duotone fa-regular fa-chart-network" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`block px-3 py-2 ${colorScheme.bg} ${colorScheme.text} ${colorScheme.hover} text-2l font-bold`}
            >
              {isOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#"
                className={`block px-3 py-2 ${colorScheme.title} ${colorScheme.hover}`}
              >
                About
              </a>
              <a
                href="#"
                className={`block px-3 py-2 ${colorScheme.title} ${colorScheme.hover}`}
              >
                {" "}
                Code{" "}
              </a>
              <a
                href="#"
                className={`block px-3 py-2 ${colorScheme.title} ${colorScheme.hover}`}
              >
                Photography
              </a>
              <a
                href="#"
                className={`block px-3 py-2 ${colorScheme.title} ${colorScheme.hover}`}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
