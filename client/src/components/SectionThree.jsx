import { Network } from "lucide-react";
import { SectionHeader, SectionContent } from "./layout-components";

function SectionThree() {
  return (
    <>
      <SectionHeader icon={Network} title="Let's Connect" />
      <SectionContent>
        {/* Example of extending the base styles for a specific section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 text-accent p-4 rounded-lg hover:bg-accent/5 transition-colors">
            <p>LinkedIn</p>
          </div>
          <div className="flex items-center space-x-2 text-accent p-4 rounded-lg hover:bg-accent/5 transition-colors">
            <p>GitHub</p>
          </div>
          <div className="flex items-center space-x-2 text-accent p-4 rounded-lg hover:bg-accent/5 transition-colors">
            <p>Twitter</p>
          </div>
          {/* Add more social links as needed */}
        </div>
      </SectionContent>
    </>
  );
}

export default SectionThree;
