import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import About from "../../components/About/About";
import Services from "../../components/Services/Services";
import Statistics from "../../components/Statistics/Statistics";
import Volunteer from "../../pages/Volunteer/Volunteer";
import Donation from "../../components/Donation/Donation";
import Emergency from "../../components/Emergency/Emergency";
import DashboardPreview from "../../components/DashboardPreview/DashboardPreview";
import Contact from "../../components/Contact/Contact";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Statistics />
      <Volunteer />
      <Donation />
      <Emergency />
      <DashboardPreview />
      <Contact />
      <Footer />
    </>
  );
}

export default Home;