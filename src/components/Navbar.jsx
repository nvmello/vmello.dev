import { useState } from "react";
import { CircleUser, Camera, ContactRound, FolderGit2 } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="">
      <div className="">nav bar</div>
    </nav>
  );
};

export default Navbar;
