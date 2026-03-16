import { useEffect, useRef } from "react";
import gsap from "gsap";

const Preloader = ({ finishLoading }) => {
    const cubeContainerRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: finishLoading,
        });

        // Text & Bar Animations
        tl.to(".loading-text", {
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
        })
        .to(".loading-bar-inner", {
            width: "100%",
            duration: 2.5,
            ease: "expo.inOut",
        }, "-=0.5")
        .to(".preloader-container", {
            y: "-100%",
            duration: 1.2,
            ease: "expo.inOut",
        });

        // 3D Cubes Animation
        const cubes = cubeContainerRef.current.querySelectorAll(".nexus-cube");
        cubes.forEach((cube, i) => {
            gsap.set(cube, {
                rotateX: gsap.utils.random(0, 360),
                rotateY: gsap.utils.random(0, 360),
                x: gsap.utils.random(-150, 150),
                y: gsap.utils.random(-150, 150),
                z: gsap.utils.random(-200, 200),
            });

            gsap.to(cube, {
                rotateX: "+=360",
                rotateY: "+=360",
                duration: gsap.utils.random(5, 10),
                repeat: -1,
                ease: "none",
            });

            gsap.to(cube, {
                y: "+=50",
                x: "+=30",
                duration: gsap.utils.random(3, 5),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        });

        return () => tl.kill();
    }, [finishLoading]);

    return (
        <div className="preloader-container fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black text-blue-50 overflow-hidden">
            {/* 3D Multiverse Scene */}
            <div 
                ref={cubeContainerRef}
                className="absolute inset-0 flex items-center justify-center [perspective:1000px] pointer-events-none opacity-40"
            >
                {[...Array(8)].map((_, i) => (
                    <div 
                        key={i} 
                        className="nexus-cube absolute size-16 [transform-style:preserve-3d]"
                    >
                        {/* 6 Sides of the Cube */}
                        {[
                            "translateZ(32px)", "translateZ(-32px) rotateY(180deg)",
                            "translateX(32px) rotateY(90deg)", "translateX(-32px) rotateY(-90deg)",
                            "translateY(-32px) rotateX(90deg)", "translateY(32px) rotateX(-90deg)"
                        ].map((transform, j) => (
                            <div 
                                key={j}
                                className="absolute inset-0 border border-violet-400/50 bg-violet-500/10 backdrop-blur-sm shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                                style={{ transform }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="relative mb-16 text-center z-10">
                <h1 className="loading-text opacity-0 font-zentry text-7xl uppercase leading-[0.9] tracking-[0.1em]">Initializing</h1>
                <h1 className="loading-text opacity-0 font-zentry text-7xl uppercase leading-[0.9] text-violet-300 tracking-[0.1em]">Multiverse</h1>
            </div>
            
            <div className="w-80 h-[2px] bg-stone-900 rounded-full overflow-hidden border-hsla z-10">
                <div className="loading-bar-inner h-full bg-violet-300 w-0 shadow-[0_0_15px_rgba(167,139,250,0.8)]" />
            </div>
            
            <div className="mt-6 font-general text-[10px] uppercase font-bold tracking-[0.5em] opacity-50 z-10 animate-pulse">
                Syncing with Metagame Layer...
            </div>

            {/* Ambient Nebula */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />
        </div>
    );
};

export default Preloader;
