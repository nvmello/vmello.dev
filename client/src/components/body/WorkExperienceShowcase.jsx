import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useColorContext } from "../../context/ColorContext";
import MyIcon from "../util/MyIcon";
import { loadAllProjects } from "../../utils/projectParser";

export const WorkExperienceShowcase = () => {
  const { colorScheme } = useColorContext();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const loadedProjects = loadAllProjects();
      // Filter only experience type items
      const workExperience = loadedProjects.filter(project => project.type === 'experience');
      setExperiences(workExperience);
    } catch (error) {
      console.error("Failed to load work experience:", error);
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
          <p>Loading work experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:gap-6 lg:gap-8">
      {experiences.map((experience, index) => (
        <ExperienceCard
          key={experience.filename || experience.title}
          experience={experience}
          index={index}
        />
      ))}
    </div>
  );
};

const ExperienceCard = ({ experience, index }) => {
  const { colorScheme } = useColorContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`
        relative rounded-xl border-2 p-6 transition-all duration-300
        ${
          colorScheme.bg === "bg-[#000000]"
            ? "border-[#111111] hover:border-[#00ff00] bg-[#030303]"
            : "border-gray-300 hover:border-green-600 bg-white/50"
        }
        group cursor-pointer
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`
              p-2 rounded-lg
              ${
                colorScheme.bg === "bg-[#000000]"
                  ? "bg-[#00ff00]/10"
                  : "bg-green-100"
              }
            `}
            >
              <MyIcon
                icon={experience.icon || "fa-solid fa-briefcase"}
                size={`text-xl ${
                  colorScheme.bg === "bg-[#000000]"
                    ? "text-[#00ff00]"
                    : "text-green-600"
                }`}
              />
            </div>
            <div>
              <h3
                className={`text-xl font-bold ${
                  colorScheme.title
                } group-hover:${
                  colorScheme.bg === "bg-[#000000]"
                    ? "text-[#00ff00]"
                    : "text-green-700"
                } transition-colors`}
              >
                {experience.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${
                    colorScheme.bg === "bg-[#000000]"
                      ? "bg-[#00ff00]/20 text-[#00ff00]"
                      : "bg-green-100 text-green-700"
                  }
                `}
                >
                  {experience.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`${colorScheme.text} mb-4 leading-relaxed`}>
          {experience.description}
        </p>

        {/* Key Responsibilities */}
        {experience.featureList && experience.featureList.length > 0 && (
          <div className="mb-4">
            <h4 className={`text-sm font-semibold ${colorScheme.title} mb-2`}>
              Key Responsibilities:
            </h4>
            <ul className={`text-sm ${colorScheme.text} space-y-1`}>
              {experience.featureList.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <MyIcon
                    icon="fa-solid fa-check"
                    size={`text-xs mr-2 ${
                      colorScheme.bg === "bg-[#000000]"
                        ? "text-[#00ff00]"
                        : "text-green-600"
                    }`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Duration */}
        {experience.duration && (
          <div className="mb-4">
            <h4 className={`text-sm font-semibold ${colorScheme.title} mb-1`}>
              Duration:
            </h4>
            <p className={`text-sm ${colorScheme.text}`}>{experience.duration}</p>
          </div>
        )}

        {/* Company */}
        {experience.company && (
          <div className="mb-4">
            <h4 className={`text-sm font-semibold ${colorScheme.title} mb-1`}>
              Company:
            </h4>
            <p className={`text-sm ${colorScheme.text}`}>{experience.company}</p>
          </div>
        )}

        {/* Tech Stack */}
        {experience.techStack && experience.techStack.length > 0 && (
          <div className="mb-6">
            <h4 className={`text-sm font-semibold ${colorScheme.title} mb-2`}>
              Tech Stack:
            </h4>
            <div className="flex flex-wrap gap-2">
              {experience.techStack.map((tech) => (
                <span
                  key={tech}
                  className={`
                  px-2 py-1 text-xs rounded-md font-medium
                  ${
                    colorScheme.bg === "bg-[#000000]"
                      ? "bg-[#030303] text-gray-400 border border-[#111111]"
                      : "bg-gray-200 text-gray-700"
                  }
                `}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WorkExperienceShowcase;