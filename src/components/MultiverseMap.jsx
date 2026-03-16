import { useRef } from "react";
import gsap from "gsap";
import AnimatedTitle from "./AnimatedTitle.jsx";

const MultiverseMap = () => {
    const mapRef = useRef(null);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const rect = mapRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;

        gsap.to(".map-scanner", {
            left: `${x}%`,
            top: `${y}%`,
            duration: 0.5,
            ease: "power2.out",
        });

        gsap.to(".map-bg", {
            backgroundPosition: `${x}% ${y}%`,
            duration: 1,
            ease: "power1.out",
        });
    };

    return (
        <section className="bg-stone-900 py-32 px-10 relative overflow-hidden">
            <div className="container mx-auto flex flex-col items-center text-center">
                <p className="font-general text-sm uppercase md:text-[10px] text-violet-300 mb-5">
                    Map the Uncharted
                </p>
                <AnimatedTitle 
                    title="The Multiverse <br /> Is <b>Y</b>ours to Sc<b>a</b>n"
                    containerClass="!text-white mb-20"
                />

                <div 
                    ref={mapRef}
                    onMouseMove={handleMouseMove}
                    className="relative w-full h-[60vh] border-hsla rounded-3xl overflow-hidden cursor-none group bg-black"
                >
                    {/* Mock Map Background with grainy texture/lines */}
                    <div className="map-bg absolute inset-0 opacity-40 bg-[url('/img/stones.webp')] bg-cover grayscale" />
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-black/80" />
                    
                    {/* Scanner Effect */}
                    <div className="map-scanner absolute size-40 border-2 border-violet-300 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-[0_0_50px_rgba(167,139,250,0.5)]">
                        <div className="size-2 bg-violet-300 rounded-full animate-ping" />
                        <span className="absolute -bottom-10 text-[10px] text-violet-300 font-bold uppercase tracking-widest whitespace-nowrap">Scanning Lore...</span>
                    </div>

                    {/* Mock Points of Interest */}
                    <div className="absolute top-1/4 left-1/3 text-left">
                        <div className="size-3 bg-white rounded-full mb-2 animate-pulse" />
                        <p className="text-[10px] text-white/50 font-bold uppercase">Sector: Zigma</p>
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 text-right">
                        <div className="size-3 bg-white rounded-full mb-2 animate-pulse" />
                        <p className="text-[10px] text-white/50 font-bold uppercase">Sector: Nexus</p>
                    </div>

                    <div className="absolute inset-0 flex flex-center pointer-events-none">
                        <p className="font-zentry text-6xl uppercase opacity-5 group-hover:opacity-10 transition-opacity">Zentry Topology</p>
                    </div>
                </div>

                <p className="mt-10 max-w-lg font-circular-web text-lg text-blue-50/50">
                    Interact with the topology above to reveal hidden sectors and encrypted transmissions from the Zentry command.
                </p>
            </div>
        </section>
    );
};

export default MultiverseMap;
