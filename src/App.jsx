import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SectionOne from "./components/SectionOne";
import SectionTwo from "./components/SectionTwo";
import SectionThree from "./components/SectionThree";

function App() {
  return (
    <div className="">
      <Navbar />
      {/* <MainContent /> */}
      <div className="">
        <hr />
        <section className="pt-16">
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
      <Footer />
    </div>
  );
}

export default App;
