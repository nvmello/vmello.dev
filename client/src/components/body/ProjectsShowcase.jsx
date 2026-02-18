import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { loadAllProjects } from "../../utils/projectParser";

export const ProjectsShowcase = () => {
  const { colorScheme } = useColorContext();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
        />
      ))}
    </div>
  );
};

const ProjectCard = ({ project, index }) => {
  const { colorScheme } = useColorContext();
  const accentColor = colorScheme.accent.replace("text-[", "").replace("]", "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`
        relative rounded-xl border-2 p-6 transition-all duration-300
        ${colorScheme.border} ${colorScheme.borderHover} ${colorScheme.bgSubtle}
        group cursor-pointer
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
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
        </div>

        {/* Description */}
        <p className={`${colorScheme.text} mb-4 leading-relaxed`}>
          {project.description}
        </p>

        {/* Features */}
        {project.featureList && project.featureList.length > 0 && (
          <div className="mb-4">
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
                    className="text-xs mr-2"
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
          <div className="mb-4">
            <h4 className={`text-sm font-semibold ${colorScheme.title} mb-1`}>
              Duration:
            </h4>
            <p className={`text-sm ${colorScheme.text}`}>{project.duration}</p>
          </div>
        )}

        {/* Company for experience items */}
        {project.type === "experience" && project.company && (
          <div className="mb-4">
            <h4 className={`text-sm font-semibold ${colorScheme.title} mb-1`}>
              Company:
            </h4>
            <p className={`text-sm ${colorScheme.text}`}>{project.company}</p>
          </div>
        )}

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="mb-6">
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
          <div className="flex space-x-3 mt-auto">
            {project.linkList.github && (
              <a
                href={project.linkList.github}
                target="_blank"
                rel="noopener noreferrer"
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${colorScheme.linkBtn}`}
              >
                <MyIcon icon="fa-solid fa-external-link" size="text-xs" />
                <span>Website</span>
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectsShowcase;
