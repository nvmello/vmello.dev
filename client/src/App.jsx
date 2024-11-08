import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SectionOne from "./components/SectionOne";
import SectionTwo from "./components/SectionTwo";
import SectionThree from "./components/SectionThree";
import SectionFour from "./components/SectionFour";

function App() {
  return (
    <div className="bg-accent-bg min-h-screen">
      <Navbar />
      <div className="container mx-auto overflow-y-auto">
        <hr className="mt-16" />
        <section className="h-[40vh] overflow-y-auto">
          <SectionOne />
        </section>
        <hr />
        <section className="h-[40vh] overflow-y-auto">
          <SectionTwo />
        </section>
        <hr />
        <section className="h-[40vh] overflow-y-auto">
          <SectionThree />
        </section>
        <hr />
        <section className="h-[40vh] overflow-y-auto">
          <SectionFour />
        </section>
      </div>
      <hr />
      <div className="bg-accent-bg">
        <Footer />
      </div>
    </div>
  );
}

export default App;
