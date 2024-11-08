import { Network } from "lucide-react";
function SectionThree() {
  return (
    <div>
      <div className="flex items-center gap-4 p-4">
        <Network className="text-accent hover:text-accent-hover" size={22} />
        <h1 className="text-xl">Lets Connect</h1>
      </div>
      <p className="ml-8 mr-16 mb-4 text-4xl">
        Link a bunch of different accounts to add friend or whatever, maybe in a
        carousel?
      </p>
    </div>
  );
}

export default SectionThree;
