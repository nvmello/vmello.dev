import PropTypes from "prop-types";

const NvmLogo = ({ className }) => {
  return (
    <svg
      height="105.0mm"
      strokeMiterlimit="10"
      className={`fill-current ${className}`} // Apply dynamic class names here
      version="1.1"
      viewBox="0 0 419.58 297.675"
      width="148.0mm"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs />
      <g id="Layer-1">
        <path
          d="M156.02 266.904L156.02 162.951L209.79 258.72L263.371 162.275L264.315 268.425M177.717 139.964L211.865 199.969L244.505 138.78M155.265 127.117L208.469 29.2501L264.315 128.808"
          fill="none"
          stroke="currentColor" // Use currentColor to reference the text color
          opacity="1"
          strokeLinecap="butt"
          strokeLinejoin="round"
          strokeWidth="15.8627"
        />
      </g>
    </svg>
  );
};

NvmLogo.propTypes = {
  className: PropTypes.string, // Validate the className prop
};

export default NvmLogo;
