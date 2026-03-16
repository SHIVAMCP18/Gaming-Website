import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Contact from "./Contact.jsx";
import Button from "./Button.jsx";
import { TiLocationArrow } from "react-icons/ti";
import AnimatedTitle from "./AnimatedTitle.jsx";
import CelestialBackground from "./CelestialBackground.jsx";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        fullName: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Mock Frontend Logic
        setTimeout(() => {
            if (isLogin) {
                // Mock success for login
                setSuccess("Success! Initializing sync with the Metagame...");
                setTimeout(() => navigate("/dashboard"), 1500);
            } else {
                // Mock success for signup
                setSuccess("Account deployed! Welcome to the Multiverse.");
                setTimeout(() => setIsLogin(true), 2000);
            }
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black text-blue-50 overflow-hidden relative">
            <Navbar />
            
            <CelestialBackground />

            <div className="relative z-10 container mx-auto px-10 pt-44 pb-20 flex items-center justify-center min-h-[80vh]">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <AnimatedTitle 
                            title={isLogin ? "Welcome <br /> <b>B</b>ack" : "Join the <br /> <b>M</b>ultiverse"}
                            containerClass="!text-white mb-4 !text-6xl"
                        />
                        <p className="font-circular-web text-lg opacity-50 mt-4">
                            {isLogin ? "Enter your credentials to sync with the Metagame." : "Begin your journey into the Play Economy."}
                        </p>
                    </div>

                    <div className="bg-stone-900/50 border-hsla p-8 rounded-2xl backdrop-blur-xl">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm">
                                {success}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Full Name</label>
                                        <input 
                                            name="fullName"
                                            type="text" 
                                            placeholder="Jace Wayland" 
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full bg-stone-900 border-hsla rounded-full px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Username</label>
                                        <input 
                                            name="username"
                                            type="text" 
                                            placeholder="CyberNinja_99" 
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            className="w-full bg-stone-900 border-hsla rounded-full px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                        />
                                    </div>
                                </>
                            )}
                            
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Email Address</label>
                                <input 
                                    name="email"
                                    type="email" 
                                    placeholder="agent@zentry.com" 
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-stone-900 border-hsla rounded-full px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Password</label>
                                <input 
                                    name="password"
                                    type="password" 
                                    placeholder="••••••••" 
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-stone-900 border-hsla rounded-full px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-50 text-black py-4 rounded-full font-zentry uppercase text-xl hover:bg-violet-300 transition-colors mt-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Processing..." : (isLogin ? "Initialize Sync" : "Deploy Identity")}
                                {!loading && <TiLocationArrow className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <span className="opacity-40">{isLogin ? "New to the nexus?" : "Already an agent?"}</span>
                            <button 
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className="ml-2 font-bold text-violet-300 hover:text-white transition-colors uppercase tracking-widest text-[11px]"
                            >
                                {isLogin ? "Create Account" : "Sign In"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Auth;
