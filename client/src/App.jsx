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

function App() {
  const { colorScheme } = useColorContext();

  const lenis = useLenis(({ scroll }) => {
    // called every scroll
  });

  return (
    <ReactLenis root>
      <div className={`${colorScheme.bg} min-h-screen flex-grow`}>
        <Navbar />
        <div className="container mx-auto overflow-y-auto">
          <hr className="mt-16" />
          <div id="about">
            <section className="min-h-[35vh] overflow-y-auto">
              <Section>
                <SectionOne />
              </Section>
            </section>
          </div>
          <hr />
          <div id="projects">
            <section className="min-h-[35vh] overflow-y-auto">
              <Section>
                <SectionTwo />
              </Section>
            </section>
          </div>
          <hr />
          <div id="connect">
            <section className="min-h-[35vh] overflow-y-auto">
              <Section>
                <SectionThree />
              </Section>
            </section>
          </div>
          <hr />
          {/* <div id="photography">
            <section className="min-h-[35vh] overflow-y-auto">
              <Section>
                <SectionFour />
              </Section>
            </section>
          </div> */}
        </div>
        <hr />
        <div className={colorScheme.bg}>
          <Footer />
        </div>
      </div>
    </ReactLenis>
  );
}

export default App;
