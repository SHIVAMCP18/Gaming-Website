import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import Vault from "./components/Vault.jsx";
import Dashboard from "./components/Dashboard.jsx";
import News from "./components/News.jsx";
import QuestSystem from "./components/QuestSystem.jsx";
import Preloader from "./components/Preloader.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import Auth from "./components/Auth.jsx";
import ContactUs from "./components/ContactUs.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { useState } from "react";

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <Router>
            <ScrollToTop />
            {isLoading && <Preloader finishLoading={() => setIsLoading(false)} />}
            <CustomCursor />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vault" element={<Vault />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/news" element={<News />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/contact-us" element={<ContactUs />} />
            </Routes>
            <QuestSystem />
        </Router>
    );
};

export default App;
