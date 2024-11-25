import React, { useState } from "react";
import { useColorContext } from "../../context/ColorContext";

export const RevealLinks = () => {
  return (
    <section className="grid place-content-center gap-2 px-8 py-24 ">
      <FlipLink href="https://github.com/nvmello">Github</FlipLink>
      <FlipLink href="#">Snapchat</FlipLink>
      <FlipLink href="#">Linkedin</FlipLink>
      <FlipLink href="#">Facebook</FlipLink>
      <FlipLink href="#">Instagram</FlipLink>
    </section>
  );
};

const STAGGER_DELAY = 25; // milliseconds

const FlipLink = ({ href, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colorScheme } = useColorContext();

  return (
    <a
      href={href}
      className={`${colorScheme.hover} ${colorScheme.text} relative block overflow-hidden whitespace-nowrap text-4xl uppercase sm:text-6xl md:text-8xl lg:text-9xl`}
      style={{ lineHeight: 0.75 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex">
        {children.split("").map((letter, i) => (
          <span
            key={`top-${i}`}
            className="inline-block transition-transform duration-250 ease-in-out"
            style={{
              transform: isHovered ? "translateY(-102%)" : "translateY(0)",
              transitionDelay: `${i * STAGGER_DELAY}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="absolute inset-0 flex">
        {children.split("").map((letter, i) => (
          <span
            key={`bottom-${i}`}
            className="inline-block transition-transform duration-250 ease-in-out"
            style={{
              transform: isHovered ? "translateY(0)" : "translateY(100%)",
              transitionDelay: `${i * STAGGER_DELAY}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </a>
  );
};
