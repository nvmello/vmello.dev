import { SectionHeader, SectionContent } from "../util/layout-components";

function SectionOne() {
  return (
    <>
      <SectionHeader icon="fa-duotone fa-solid fa-user" title="About me" />
      <SectionContent>
        <p>
          I&apos;m Nick, a software engineer who loves translating ideas into solutions. 
          I&apos;m fascinated by AI and how it&apos;s reshaping how we communicate intent and solve problems.
        </p>
        <p>
          When I&apos;m not building systems, you&apos;ll find me rock climbing, lifting weights, 
          or exploring new places with my camera. I studied Computer Science at Arizona State University.
        </p>
        <p>
          Let&apos;s connect.
        </p>
      </SectionContent>
    </>
  );
}

export default SectionOne;
