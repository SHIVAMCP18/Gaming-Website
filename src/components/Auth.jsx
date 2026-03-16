import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Contact from "./Contact.jsx";
import Button from "./Button.jsx";
import { TiLocationArrow } from "react-icons/ti";
import AnimatedTitle from "./AnimatedTitle.jsx";
import CelestialBackground from "./CelestialBackground.jsx";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

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
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Username</label>
                                    <input 
                                        type="text" 
                                        placeholder="CyberNinja_99" 
                                        className="w-full bg-stone-900 border-hsla rounded-full px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                    />
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="agent@zentry.com" 
                                    className="w-full bg-stone-900 border-hsla rounded-full px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Password</label>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="w-full bg-stone-900 border-hsla rounded-full px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                />
                            </div>

                            <button className="w-full bg-blue-50 text-black py-4 rounded-full font-zentry uppercase text-xl hover:bg-violet-300 transition-colors mt-4 flex items-center justify-center gap-2 group">
                                {isLogin ? "Initialize Sync" : "Deploy Identity"}
                                <TiLocationArrow className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <span className="opacity-40">{isLogin ? "New to the nexus?" : "Already an agent?"}</span>
                            <button 
                                onClick={() => setIsLogin(!isLogin)}
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
