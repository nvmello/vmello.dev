import { SectionHeader, SectionContent } from "../util/layout-components";

function SectionOne() {
  return (
    <>
      <SectionHeader icon="fa-duotone fa-solid fa-user" title="About me" />
      <SectionContent>
        <p>
          I'm Nick, a software engineer focused on building systems that turn ideas
          into working software. I'm particularly interested in how AI is changing
          the way we design, communicate, and ship.
        </p>
        <p>
          A lot of my focus is on reducing friction, improving how work flows, and
          finding better ways to turn intent into working systems. I'm motivated
          by building systems that save time, reduce complexity, and help people
          focus on what actually matters.
        </p>
        <p>
          Outside of engineering, I spend time rock climbing, lifting, and exploring
          new places with my camera. I studied Computer Science at Arizona State
          University.
        </p>
      </SectionContent>
    </>
  );
}

export default SectionOne;
