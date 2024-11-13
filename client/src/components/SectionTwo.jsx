import { FolderGit2 } from "lucide-react";
import { SectionHeader, SectionContent } from "./layout-components"; // You'll need to export these

function SectionTwo() {
  return (
    <>
      <SectionHeader icon={FolderGit2} title="Work" />
      <SectionContent>
        <p className="text-accent">Coming soon</p>
      </SectionContent>
    </>
  );
}

export default SectionTwo;
