import { useState, useEffect } from "react";
import MyMarquee from "./MyMarquee";
import NvmLogo from "./NvmLogo";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";
import { gsap } from "gsap";

import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { colorScheme, changeTheme } = useColorContext();

  useEffect(() => {
    // Handle initial hash on page load
    scrollToHash(window.location.hash);

    // Add event listeners to all links
    document.querySelectorAll("a[href]").forEach((a) => {
      a.addEventListener("click", (e) => {
        scrollToHash(getSamePageAnchor(a), e);
      });
    });
  }, []);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLinkClick = (e) => {
    // Get the hash from the clicked link's href
    const hash = e.currentTarget.getAttribute("href");
    // Scroll to the section
    scrollToHash(hash, e);
    // Close the menu
    setIsOpen(false);
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
            <MyIcon link="#about" icon="fa-duotone fa-solid fa-user" />
            <MyIcon
              link="#projects"
              icon="fa-duotone fa-solid fa-display-code"
            />
            <MyIcon
              link="#connect"
              icon="fa-duotone fa-regular fa-chart-network"
            />
            <MyIcon
              link="#photography"
              icon="fa-duotone fa-regular fa-camera"
            />
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
                href="#about"
                onClick={handleLinkClick}
                className={`block px-3 py-2 ${colorScheme.title} ${colorScheme.hover}`}
              >
                About
              </a>
              <a
                href="#projects"
                onClick={handleLinkClick}
                className={`block px-3 py-2 ${colorScheme.title} ${colorScheme.hover}`}
              >
                Projects
              </a>
              <a
                href="#connect"
                onClick={handleLinkClick}
                className={`block px-3 py-2 ${colorScheme.title} ${colorScheme.hover}`}
              >
                Connect
              </a>
              <a
                href="#photography"
                onClick={handleLinkClick}
                className={`block px-3 py-2 ${colorScheme.title} ${colorScheme.hover}`}
              >
                Photography
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// Detect if a link's href goes to the current page
function getSamePageAnchor(link) {
  if (
    link.protocol !== window.location.protocol ||
    link.host !== window.location.host ||
    link.pathname !== window.location.pathname ||
    link.search !== window.location.search
  ) {
    return false;
  }

  return link.hash;
}

// Scroll to a given hash, preventing the event given if there is one
const scrollToHash = (hash, e) => {
  const elem = hash ? document.querySelector(hash) : false;
  if (elem) {
    if (e) e.preventDefault();
    gsap.to(window, {
      scrollTo: { y: elem, offsetY: 70 },
      ease: "power2.inOut",
      duration: 1,
    });
  }
};
