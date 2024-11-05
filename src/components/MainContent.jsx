import SectionOne from "./SectionOne";
import SectionTwo from "./SectionTwo";
import SectionThree from "./SectionThree";

function MainContent() {
  return (
    <main className="">
      <div className="">
        <hr />
        <section className="">
          <SectionOne />
        </section>
        <hr />
        <section className="">
          <SectionTwo />
        </section>
        <hr />
        <section className="">
          <SectionThree />
        </section>
      </div>
      <hr />
    </main>
  );
}

export default MainContent;
