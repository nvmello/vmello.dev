import { useAnimate } from "framer-motion";
import React, { useRef } from "react";
import { FiMousePointer } from "react-icons/fi";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";

export const Example = () => {
  const { colorScheme } = useColorContext();

  return (
    <MouseImageTrail
      renderImageBuffer={50}
      rotationRange={25}
      images={[
        "/photos/a.jpg",
        "/photos/b.jpg",
        "/photos/c.jpg",
        "/photos/d.jpg",
        "/photos/e.jpg",
        "/photos/f.jpg",
        "/photos/g.jpg",
        "/photos/h.jpg",
      ]}
    >
      <section
        className={`grid h-[50vh] w-full place-content-center rounded-lg ${colorScheme.bg} ${colorScheme.borderAccent}`}
      >
        <p
          className={`flex items-center gap-2 text-3xl font-bold uppercase ${colorScheme.text} `}
        >
          <MyIcon icon="hidden md:block fa-sharp-duotone fa-regular fa-arrow-pointer" />
          <MyIcon icon="md:hidden fa-duotone fa-solid fa-hand-point-up" />
          <span className="hidden md:block">Hover me</span>
          <span className="md:hidden">Touch me</span>
        </p>
      </section>
    </MouseImageTrail>
  );
};

const MouseImageTrail = ({
  children,
  // List of image sources
  images,
  // Will render a new image every X pixels between mouse moves
  renderImageBuffer,
  // images will be rotated at a random number between zero and rotationRange,
  // alternating between a positive and negative rotation
  rotationRange,
}) => {
  const [scope, animate] = useAnimate();

  const lastRenderPosition = useRef({ x: 0, y: 0 });
  const imageRenderCount = useRef(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;

    // Get the container's position relative to the viewport
    const rect = scope.current.getBoundingClientRect();

    // Calculate mouse position relative to the container
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    const distance = calculateDistance(
      relativeX,
      relativeY,
      lastRenderPosition.current.x,
      lastRenderPosition.current.y
    );

    if (distance >= renderImageBuffer) {
      lastRenderPosition.current.x = relativeX;
      lastRenderPosition.current.y = relativeY;

      renderNextImage(relativeX, relativeY);
    }
  };
  const handleTouchStart = (e) => {
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];

    // Get the container's position relative to the viewport
    const rect = scope.current.getBoundingClientRect();

    // Calculate mouse position relative to the container
    const relativeX = touch.clientX - rect.left;
    const relativeY = touch.clientY - rect.top;

    const distance = calculateDistance(
      relativeX,
      relativeY,
      lastRenderPosition.current.x,
      lastRenderPosition.current.y
    );

    if (distance >= renderImageBuffer) {
      lastRenderPosition.current.x = relativeX;
      lastRenderPosition.current.y = relativeY;

      renderNextImage(relativeX, relativeY);
    }
  };

  const calculateDistance = (x1, y1, x2, y2) => {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;

    // Using the Pythagorean theorem to calculate the distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
  };

  const renderNextImage = (x, y) => {
    const imageIndex = imageRenderCount.current % images.length;
    const selector = `[data-mouse-move-index="${imageIndex}"]`;

    const el = document.querySelector(selector);

    el.style.top = `${y}px`;
    el.style.left = `${x}px`;
    el.style.zIndex = imageRenderCount.current.toString();

    const rotation = Math.random() * rotationRange;

    animate(
      selector,
      {
        opacity: [0, 1],
        transform: [
          `translate(-50%, -25%) scale(0.5) ${
            imageIndex % 2
              ? `rotate(${rotation}deg)`
              : `rotate(-${rotation}deg)`
          }`,
          `translate(-50%, -50%) scale(1) ${
            imageIndex % 2
              ? `rotate(-${rotation}deg)`
              : `rotate(${rotation}deg)`
          }`,
        ],
      },
      { type: "spring", damping: 15, stiffness: 200 }
    );

    animate(
      selector,
      {
        opacity: [1, 0],
      },
      { ease: "linear", duration: 0.5, delay: 5 }
    );

    imageRenderCount.current += 1;
  };

  const { colorScheme } = useColorContext();
  return (
    <div className="grid w-full grid-rows-[50vh_auto]">
      <div
        ref={scope}
        className="relative overflow-hidden touch-none select-none"
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {children}

        {images.map((img, index) => (
          <img
            className={`pointer-events-none absolute left-0 top-0 h-48 w-auto rounded-xl border-2 object-cover opacity-0 ${colorScheme.borderAccent} ${colorScheme.bgFaded} `}
            src={img}
            alt={`Mouse move image ${index}`}
            key={index}
            data-mouse-move-index={index}
          />
        ))}
      </div>
    </div>
  );
};
