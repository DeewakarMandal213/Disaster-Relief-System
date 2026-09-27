import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import About from "../../components/About/About";
import Volunteer from "../../pages/Volunteer/Volunteer";
import Donation from "../../components/Donation/Donation";
import DashboardPreview from "../../components/DashboardPreview/DashboardPreview";
import Contact from "../../components/Contact/Contact";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <section id="about">
        <About />
      </section>

      <section id="features">
        <Volunteer />
      </section>

      <section id="donation">
        <Donation />
      </section>

      <section id="dashboard">
        <DashboardPreview />
      </section>

      <section id="contact">
        <Contact />
      </section>

      <Footer />
    </>
  );
}

export default Home;