/**
 * Project Parser Utility
 * Parses markdown files for project and experience data
 */

// Import markdown files directly (Vite-compatible approach)
import nextgearCapitalMd from "../projects/nextgear-capital.md?raw";
import raytheonEmbeddedMd from "../projects/raytheon-embedded.md?raw";
import audiocrateSystemMd from "../projects/audiocrate-system.md?raw";
import vmelloDevMd from "../projects/vmello.dev.md?raw";

// Project files mapping
const projectFiles = {
  "nextgear-capital.md": nextgearCapitalMd,
  "raytheon-embedded.md": raytheonEmbeddedMd,
  "audiocrate-system.md": audiocrateSystemMd,
  "vmello.dev.md": vmelloDevMd,
};

/**
 * Parses markdown content to extract project data
 */
export const parseMarkdownProject = (content) => {
  const lines = content.split("\n");
  const project = {};

  let currentSection = null;
  let contentLines = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      project.title = line.replace("# ", "").trim();
    } else if (line.startsWith("## ")) {
      // Save previous section content
      if (currentSection && contentLines.length > 0) {
        project[currentSection.toLowerCase().replace(/\s+/g, "_")] =
          contentLines.join("\n").trim();
        contentLines = [];
      }

      currentSection = line.replace("## ", "").trim();
    } else if (currentSection) {
      contentLines.push(line);
    }
  }

  // Save final section
  if (currentSection && contentLines.length > 0) {
    project[currentSection.toLowerCase().replace(/\s+/g, "_")] = contentLines
      .join("\n")
      .trim();
  }

  // Parse tech stack into array
  if (project.tech_stack) {
    project.techStack = project.tech_stack
      .split("\n")
      .map((line) => line.replace(/^- /, "").trim())
      .filter((line) => line.length > 0);
  }

  // Parse features into array
  if (project.features) {
    project.featureList = project.features
      .split("\n")
      .map((line) => line.replace(/^- /, "").trim())
      .filter((line) => line.length > 0);
  }

  // Parse links
  if (project.links) {
    project.linkList = {};
    project.links.split("\n").forEach((line) => {
      const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
      if (match) {
        const [, label, url] = match;
        project.linkList[label.toLowerCase()] = url;
      }
    });
  }

  return project;
};

/**
 * Loads and parses all project markdown files
 */
export const loadAllProjects = () => {
  const projects = [];

  for (const [filename, content] of Object.entries(projectFiles)) {
    try {
      const parsedProject = parseMarkdownProject(content);

      // Add filename for reference
      parsedProject.filename = filename.replace(".md", "");

      projects.push(parsedProject);
    } catch (error) {
      console.warn(`Failed to load project file ${filename}:`, error);
    }
  }

  // Sort by custom order: Nextgear, Raytheon, vmello.dev, AudioCrate
  return projects.sort((a, b) => {
    const customOrder = {
      "nextgear-capital": 0,
      "raytheon-embedded": 1,
      "vmello.dev": 2,
      "audiocrate-system": 3,
    };
    
    const aOrder = customOrder[a.filename] ?? 99;
    const bOrder = customOrder[b.filename] ?? 99;
    
    return aOrder - bOrder;
  });
};

export default { parseMarkdownProject, loadAllProjects };
