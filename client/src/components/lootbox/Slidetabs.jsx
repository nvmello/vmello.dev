import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useColorContext } from "../../context/ColorContext";

export const SlideTabsExample = () => {
  return (
    <div className="">
      <SlideTabs />
    </div>
  );
};

const SlideTabs = () => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      onMouseLeave={() => {
        setPosition((pv) => ({
          ...pv,
          opacity: 0,
        }));
      }}
      className="relative mx-auto flex w-fit rounded-full border-2 p-1"
    >
      <Tab setPosition={setPosition}>Work</Tab>
      <Tab setPosition={setPosition}>Play</Tab>
      {/* <Tab setPosition={setPosition}>Pay</Tab> */}

      <Cursor position={position} />
    </ul>
  );
};

const Tab = ({ children, setPosition }) => {
  const ref = useRef(null);
  const { colorScheme, changeTheme } = useColorContext();
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref?.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className={`${colorScheme.title}relative z-10 block cursor-pointer px-3 py-1.5 text-xs uppercase  mix-blend-difference md:px-3 md:py-1 md:text-base`}
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }) => {
  const { colorScheme, changeTheme } = useColorContext();

  return (
    <motion.li
      animate={{
        ...position,
      }}
      className={`${colorScheme.bgHover} absolute z-0 h-7 rounded-full  md:h-8`}
    />
  );
};
