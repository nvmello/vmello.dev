import { useState } from "react";
import { CircleUser, Camera, ContactRound, FolderGit2 } from "lucide-react";
import MyMarquee from "./MyMarquee";
import NvmLogo from "./NvmLogo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed w-full top-0 left-0 shadow-md bg-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="h-14 w-14 text-accent hover:text-accent-hover">
              <NvmLogo className="h-14 w-14" />
            </div>
          </div>
          <MyMarquee />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-accent hover:text-accent-hover">
              <CircleUser
                className="text-accent hover:text-accent-hover"
                size={24}
              />
            </a>
            <a href="#" className="text-accent hover:text-accent-hover">
              <FolderGit2
                className="text-accent hover:text-accent-hover"
                size={24}
              />
            </a>
            <a href="#" className="text-accent hover:text-accent-hover">
              <Camera
                className="text-accent hover:text-accent-hover"
                size={24}
              />
            </a>
            <a href="#" className="text-accent hover:text-accent-hover">
              <ContactRound className="text-accent hover:text-accent-hover" />
            </a>
            {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Sign In
            </button> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-accent hover:text-accent-hover text-2l font-bold"
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
                className="block px-3 py-2 text-accent hover:text-accent-hover"
              >
                About
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-accent hover:text-accent-hover"
              >
                {" "}
                Code{" "}
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-accent hover:text-accent-hover"
              >
                Photography
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-accent hover:text-accent-hover"
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
