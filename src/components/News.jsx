import { useState, useEffect } from "react";
import Navbar from "./Navbar.jsx";
import Contact from "./Contact.jsx";
import { BentoTilt, BentoCard } from "./Features.jsx";
import CelestialBackground from "./CelestialBackground.jsx";

const News = () => {
    return (
        <div className="min-h-screen bg-black text-blue-50 relative overflow-hidden">
            <Navbar />
            <CelestialBackground />
            
            <div className="container mx-auto px-10 py-32 relative z-10">
                <h1 className="special-font font-zentry text-6xl uppercase leading-tight">Zentry News</h1>
                <p className="max-w-lg font-circular-web text-lg opacity-50 mb-20">
                    Stay updated with the latest drops, patches, and multiversal events.
                </p>

                <div className="grid h-[200vh] w-full grid-cols-2 grid-rows-6 gap-7">
                    <BentoTilt className="border-hsla col-span-2 row-span-2 overflow-hidden rounded-md">
                        <BentoCard 
                            src="/videos/feature-1.mp4"
                            title="The Great Expansion"
                            description="New realms are merging with Zentry. Prepare for the largest content update yet."
                            isComingSoon
                        />
                    </BentoTilt>

                    <BentoTilt className="border-hsla col-span-1 row-span-2 overflow-hidden rounded-md">
                        <BentoCard 
                            src="/videos/feature-2.mp4"
                            title="Zigma Drop #3"
                            description="The third collection of Zigma NFTs is about to drop. Get your whitelist spot now."
                            isComingSoon
                        />
                    </BentoTilt>

                    <BentoTilt className="border-hsla col-span-1 row-span-1 overflow-hidden rounded-md">
                         <div className="p-10 flex flex-col justify-between h-full bg-violet-300 text-black">
                            <h2 className="font-zentry text-3xl uppercase">Patch v2.4.0</h2>
                            <p className="font-circular-web text-sm">Improved GSAP performance and resolved minor clip-path glitches.</p>
                            <span className="text-[10px] uppercase font-bold">Read Notes</span>
                         </div>
                    </BentoTilt>

                    <BentoTilt className="border-hsla col-span-1 row-span-1 overflow-hidden rounded-md">
                         <div className="p-10 flex flex-col justify-between h-full bg-stone-900/80 backdrop-blur-md">
                            <h2 className="font-zentry text-3xl uppercase">Dev Log #12</h2>
                            <p className="font-circular-web text-sm opacity-50">Building the Play Economy layer by layer.</p>
                            <span className="text-[10px] uppercase font-bold">Watch Video</span>
                         </div>
                    </BentoTilt>

                    <BentoTilt className="border-hsla col-span-2 row-span-2 overflow-hidden rounded-md">
                        <BentoCard 
                            src="/videos/feature-3.mp4"
                            title="Nexus Social Hub"
                            description="Connect deeper. New voice channels and VR integration testing begins this week."
                            isComingSoon
                        />
                    </BentoTilt>
                </div>
            </div>

        </div>
    );
};

export default News;
