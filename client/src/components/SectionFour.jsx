import { Camera } from "lucide-react";
import { SectionHeader, SectionContent } from "./layout-components";

function SectionFour() {
  return (
    <>
      <SectionHeader icon={Camera} title="Photography" />
      <SectionContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-accent">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Repudiandae saepe provident officiis quibusdam iusto. Molestias
              iste officia incidunt optio modi, voluptate at architecto mollitia
              obcaecati illum dolor maiores deserunt rerum?
            </p>
            <button className="px-4 py-2 text-accent hover:text-accent-hover border border-accent hover:border-accent-hover rounded-lg transition-colors">
              View Gallery
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-accent/10 rounded-lg"></div>
            <div className="aspect-square bg-accent/10 rounded-lg"></div>
            <div className="aspect-square bg-accent/10 rounded-lg"></div>
            <div className="aspect-square bg-accent/10 rounded-lg"></div>
          </div>
        </div>
      </SectionContent>
    </>
  );
}

export default SectionFour;
