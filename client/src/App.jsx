import React from "react";
import Navbar from "./components/nav/Navbar";
import Footer from "./components/body/Footer";
import SectionOne from "./components/body/SectionOne";
import SectionTwo from "./components/body/SectionTwo";
import SectionThree from "./components/body/SectionThree";
import SectionFour from "./components/body/SectionFour";
import { Section } from "./components/util/layout-components";
import { useColorContext } from "./context/ColorContext";
import { ReactLenis, useLenis } from "lenis/react";

const SectionDivider = () => {
  const { colorScheme } = useColorContext();
  return (
    <div className="py-4 sm:py-6">
      <div className={`h-px bg-gradient-to-r ${colorScheme.divider}`} />
    </div>
  );
};

function App() {
  const { colorScheme } = useColorContext();

  const lenis = useLenis(({ scroll }) => {
    // called every scroll
  });

  return (
    <ReactLenis root>
      <div className={`${colorScheme.bg} min-h-screen flex-grow`}>
        <Navbar />
        <div className="container mx-auto">
          <div className="mt-16" />
          <SectionDivider />
          <div id="about">
            <section className="min-h-[35vh]">
              <Section>
                <SectionOne />
              </Section>
            </section>
          </div>
          <SectionDivider />
          <div id="projects">
            <section className="min-h-[35vh]">
              <Section>
                <SectionTwo />
              </Section>
            </section>
          </div>
          <SectionDivider />
          <div id="connect">
            <section className="min-h-[35vh]">
              <Section>
                <SectionThree />
              </Section>
            </section>
          </div>
          <SectionDivider />
        </div>
        <div className={colorScheme.bg}>
          <Footer />
        </div>
      </div>
    </ReactLenis>
  );
}

export default App;
