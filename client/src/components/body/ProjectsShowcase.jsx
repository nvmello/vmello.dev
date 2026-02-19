import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { loadAllProjects } from "../../utils/projectParser";
import { gsap } from "gsap";

const MOBILE_BREAKPOINT = 768;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
};

export const ProjectsShowcase = () => {
  const { colorScheme } = useColorContext();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      const loadedProjects = loadAllProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggle = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`text-center ${colorScheme.text}`}>
          <div className="animate-spin mb-2">
            <MyIcon icon="fa-solid fa-spinner" size="text-2xl" />
          </div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:gap-6 lg:gap-8">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.filename || project.title}
          project={project}
          index={index}
          isMobile={isMobile}
          isExpanded={expandedIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
};

const ProjectCardDetails = ({ project, colorScheme, accentColor }) => (
  <div className="space-y-4">
    {/* Features */}
    {project.featureList && project.featureList.length > 0 && (
      <div>
        <h4 className={`text-sm font-semibold ${colorScheme.title} mb-2`}>
          {project.type === "experience"
            ? "Key Responsibilities:"
            : "Key Features:"}
        </h4>
        <ul className={`text-sm ${colorScheme.text} space-y-1`}>
          {project.featureList.map((feature, i) => (
            <li key={i} className="flex items-center">
              <FontAwesomeIcon
                icon={faCheck}
                className="text-xs mr-2 shrink-0"
                style={{ color: accentColor }}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Duration for experience items */}
    {project.type === "experience" && project.duration && (
      <div>
        <h4 className={`text-sm font-semibold ${colorScheme.title} mb-1`}>
          Duration:
        </h4>
        <p className={`text-sm ${colorScheme.text}`}>{project.duration}</p>
      </div>
    )}

    {/* Company for experience items */}
    {project.type === "experience" && project.company && (
      <div>
        <h4 className={`text-sm font-semibold ${colorScheme.title} mb-1`}>
          Company:
        </h4>
        <p className={`text-sm ${colorScheme.text}`}>{project.company}</p>
      </div>
    )}

    {/* Tech Stack */}
    {project.techStack && project.techStack.length > 0 && (
      <div>
        <h4 className={`text-sm font-semibold ${colorScheme.title} mb-2`}>
          Tech Stack:
        </h4>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className={`px-2 py-1 text-xs rounded-md font-medium ${colorScheme.techPill}`}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Links */}
    {project.linkList && Object.keys(project.linkList).length > 0 && (
      <div className="flex flex-wrap gap-3 pt-2">
        {project.linkList.github && (
          <a
            href={project.linkList.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${colorScheme.linkBtn}`}
          >
            <MyIcon icon="fa-brands fa-github" size="text-xs" />
            <span>Code</span>
          </a>
        )}
        {project.linkList["live demo"] && (
          <a
            href={project.linkList["live demo"]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${colorScheme.linkBtn}`}
          >
            <MyIcon icon="fa-solid fa-external-link" size="text-xs" />
            <span>Live Demo</span>
          </a>
        )}
        {project.linkList.website && (
          <a
            href={project.linkList.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${colorScheme.linkBtn}`}
          >
            <MyIcon icon="fa-solid fa-external-link" size="text-xs" />
            <span>Website</span>
          </a>
        )}
      </div>
    )}
  </div>
);

const ProjectCard = ({ project, index, isMobile, isExpanded, onToggle }) => {
  const { colorScheme } = useColorContext();
  const accentColor = colorScheme.accent.replace("text-[", "").replace("]", "");
  const detailsRef = useRef(null);
  const chevronRef = useRef(null);

  const hasDetails =
    (project.featureList && project.featureList.length > 0) ||
    (project.type === "experience" && project.duration) ||
    (project.type === "experience" && project.company) ||
    (project.techStack && project.techStack.length > 0) ||
    (project.linkList && Object.keys(project.linkList).length > 0);

  // GSAP accordion animation — mobile only
  useEffect(() => {
    if (!isMobile || !detailsRef.current) return;

    if (isExpanded) {
      gsap.set(detailsRef.current, { display: "block" });
      gsap.fromTo(
        detailsRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    } else {
      gsap.to(detailsRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          if (detailsRef.current) {
            gsap.set(detailsRef.current, { display: "none" });
          }
        },
      });
    }
  }, [isExpanded, isMobile]);

  useEffect(() => {
    if (!isMobile || !chevronRef.current) return;
    gsap.to(chevronRef.current, {
      rotation: isExpanded ? 180 : 0,
      duration: 0.3,
      ease: "power2.inOut",
    });
  }, [isExpanded, isMobile]);

  // When switching from mobile to desktop, reset the GSAP state
  useEffect(() => {
    if (!isMobile && detailsRef.current) {
      gsap.set(detailsRef.current, {
        height: "auto",
        opacity: 1,
        display: "block",
      });
    }
  }, [isMobile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`
        relative rounded-xl border-2 p-4 sm:p-6 transition-[border-color,box-shadow] duration-300
        ${colorScheme.border} ${colorScheme.borderHover} ${colorScheme.bgSubtle}
        ${colorScheme.hoverGlow} active:scale-[0.98]
        group
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header + Description (always visible) */}
        <div
          className={isMobile && hasDetails ? "cursor-pointer" : ""}
          onClick={isMobile && hasDetails ? onToggle : undefined}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${colorScheme.accentBg}`}>
                <MyIcon
                  icon={project.icon || "fa-solid fa-code"}
                  size={`text-xl ${colorScheme.accentIcon}`}
                />
              </div>
              <div>
                <h3
                  className={`text-xl font-bold ${colorScheme.title} transition-colors`}
                >
                  {project.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${colorScheme.accentBadge}`}
                  >
                    {project.status}
                  </span>
                  {project.type === "experience" && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${colorScheme.typeBadge}`}
                    >
                      Work Experience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isMobile && hasDetails && (
              <div ref={chevronRef} className={`mt-1 ${colorScheme.text}`}>
                <FontAwesomeIcon icon={faChevronDown} className="text-sm" />
              </div>
            )}
          </div>

          <p className={`${colorScheme.text} mb-4 leading-relaxed`}>
            {project.description}
          </p>
        </div>

        {/* Details — collapsible on mobile, always visible on desktop */}
        {hasDetails && (
          <>
            {/* Mobile: GSAP-animated accordion */}
            {isMobile ? (
              <div
                ref={detailsRef}
                className="overflow-hidden"
                style={{ height: 0, opacity: 0, display: "none" }}
              >
                <ProjectCardDetails
                  project={project}
                  colorScheme={colorScheme}
                  accentColor={accentColor}
                />
              </div>
            ) : (
              /* Desktop: always shown */
              <ProjectCardDetails
                project={project}
                colorScheme={colorScheme}
                accentColor={accentColor}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectsShowcase;
