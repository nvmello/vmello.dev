import { Camera } from "lucide-react";
function SectionThree() {
  return (
    <div>
      <div className="flex items-center gap-4 p-4">
        <Camera className="text-accent hover:text-accent-hover" size={22} />
        <h1 className="text-xl">Photography</h1>
      </div>
      <p className="ml-8 mr-16 mb-4 text-4xl">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repudiandae
        saepe provident officiis quibusdam iusto. Molestias iste officia
        incidunt optio modi, voluptate at architecto mollitia obcaecati illum
        dolor maiores deserunt rerum?
      </p>
    </div>
  );
}

export default SectionThree;
