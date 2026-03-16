import Hero from "./Hero.jsx";
import About from "./About.jsx";
import Navbar from "./Navbar.jsx";
import Features from "./Features.jsx";
import Story from "./Story.jsx";
import Contact from "./Contact.jsx";
import MultiverseMap from "./MultiverseMap.jsx";
import CelestialBackground from "./CelestialBackground.jsx";

const Home = () => {
    return (
        <main className="relative min-h-screen w-screen overflow-x-hidden">
            <Navbar />
            <CelestialBackground />
            <Hero />
            <About />
            <Features />
            <MultiverseMap />
            <Story />
            <Contact />
        </main>
    );
};

export default Home;
