import { useState } from "react";
import Navbar from "./Navbar.jsx";
import Contact from "./Contact.jsx";
import { TiLocationArrow } from "react-icons/ti";
import AnimatedTitle from "./AnimatedTitle.jsx";
import CelestialBackground from "./CelestialBackground.jsx";

const ContactUs = () => {
    return (
        <div className="min-h-screen bg-black text-blue-50 overflow-hidden relative">
            <Navbar />
            <CelestialBackground />
            
            <div className="container mx-auto px-10 pt-44 pb-32">
                <div className="flex flex-col lg:flex-row gap-20 items-start">
                    <div className="lg:w-1/2">
                        <p className="font-general text-[10px] uppercase tracking-[0.2em] text-violet-300 mb-5">
                            Connect with the Command
                        </p>
                        <AnimatedTitle 
                            title="<b>H</b>ave <br /> <b>Q</b>uestions? <br /> <b>G</b>et in <b>T</b>ouch"
                            containerClass="!text-white mb-10 !text-7xl !text-left"
                        />
                        <p className="font-circular-web text-lg opacity-50 max-w-md leading-relaxed mt-10">
                            Whether you're looking for technical support, partnership opportunities, or just want to report a glitch in the multiverse, our team is ready to assist.
                        </p>

                        <div className="mt-20 space-y-10">
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-30 mb-2">General Inquiry</p>
                                <p className="font-zentry text-3xl uppercase">hello@zentry.com</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold opacity-30 mb-2">Press & Media</p>
                                <p className="font-zentry text-3xl uppercase">press@zentry.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 w-full">
                        <div className="bg-stone-900 p-10 rounded-3xl border-hsla relative overflow-hidden group">
                            {/* Visual Flare */}
                            <div className="absolute top-0 right-0 size-32 bg-violet-300/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-violet-300/20 transition-all duration-700" />
                            
                            <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ishan Zentry" 
                                            className="w-full bg-stone-800 border-hsla rounded-2xl px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Email</label>
                                        <input 
                                            type="email" 
                                            placeholder="agent@zentry.com" 
                                            className="w-full bg-stone-800 border-hsla rounded-2xl px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Subject</label>
                                    <select className="w-full bg-stone-800 border-hsla rounded-2xl px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors appearance-none cursor-pointer">
                                        <option>General Support</option>
                                        <option>Partnerships</option>
                                        <option>Lore Submission</option>
                                        <option>Technical Issue</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Message</label>
                                    <textarea 
                                        rows="5"
                                        placeholder="Transmit your message..." 
                                        className="w-full bg-stone-800 border-hsla rounded-2xl px-6 py-4 text-white focus:border-violet-300 outline-none transition-colors resize-none"
                                    />
                                </div>

                                <button className="w-full bg-blue-50 text-black py-5 rounded-2xl font-zentry uppercase text-xl hover:bg-violet-300 transition-colors flex items-center justify-center gap-3 group">
                                    Initiate Transmission
                                    <TiLocationArrow className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
