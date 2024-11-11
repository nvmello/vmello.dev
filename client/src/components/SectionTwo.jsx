import { FolderGit2 } from "lucide-react";
import { SectionHeader, SectionContent } from "./layout-components"; // You'll need to export these

function SectionTwo() {
  return (
    <>
      <SectionHeader icon={FolderGit2} title="Work" />
      <SectionContent>
        <p className="text-accent">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repudiandae
          saepe provident officiis quibusdam iusto. Molestias iste officia
          incidunt optio modi, voluptate at architecto mollitia obcaecati illum
          dolor maiores deserunt rerum?
        </p>
      </SectionContent>
    </>
  );
}

export default SectionTwo;
