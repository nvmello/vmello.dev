import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MyMarquee from "./MyMarquee";
import NvmLogo from "./NvmLogo";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";
import { gsap } from "gsap";

import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const HamburgerIcon = ({ isOpen, colorScheme }) => (
  <div className="w-6 h-5 relative flex flex-col justify-between">
    <motion.span
      className={`block h-[2px] w-full rounded-full ${colorScheme.bg === "bg-[#000000]" ? "bg-gray-400" : "bg-gray-500"}`}
      animate={isOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
    <motion.span
      className={`block h-[2px] w-full rounded-full ${colorScheme.bg === "bg-[#000000]" ? "bg-gray-400" : "bg-gray-500"}`}
      animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    />
    <motion.span
      className={`block h-[2px] w-full rounded-full ${colorScheme.bg === "bg-[#000000]" ? "bg-gray-400" : "bg-gray-500"}`}
      animate={isOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    />
  </div>
);

const mobileLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#connect", label: "Connect" },
];

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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className="p-2"
            >
              <HamburgerIcon isOpen={isOpen} colorScheme={colorScheme} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-2 pt-2 pb-4 space-y-1">
                {mobileLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                    className={`block px-4 py-2.5 font-mono text-sm tracking-wide border-l-2 border-transparent hover:border-current ${colorScheme.title} ${colorScheme.hover}`}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
