import { useEffect, useRef } from "react";
import gsap from "gsap";

const CelestialBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const planets = container.querySelectorAll(".planet");

        planets.forEach((planet, i) => {
            // Random initial placement
            gsap.set(planet, {
                x: gsap.utils.random(0, window.innerWidth),
                y: gsap.utils.random(0, window.innerHeight),
                scale: gsap.utils.random(0.4, 1.2),
                z: gsap.utils.random(-100, 100),
            });

            // Orbital/Floating drift
            gsap.to(planet, {
                x: `+=${gsap.utils.random(-100, 100)}`,
                y: `+=${gsap.utils.random(-100, 100)}`,
                duration: gsap.utils.random(15, 30),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.5,
            });

            // Gentle rotation
            gsap.to(planet.querySelector(".planet-body"), {
                rotate: 360,
                duration: gsap.utils.random(20, 60),
                repeat: -1,
                ease: "none",
            });
        });

        const onMouseMove = (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const moveX = (clientX - centerX) / 40;
            const moveY = (clientY - centerY) / 40;

            gsap.to(container, {
                paddingLeft: moveX,
                paddingTop: moveY,
                duration: 1.5,
                ease: "power2.out",
            });
        };

        window.addEventListener("mousemove", onMouseMove);
        return () => window.removeEventListener("mousemove", onMouseMove);
    }, []);

    const planetStyles = [
        { color: "rgba(139, 92, 246, 0.4)", ring: true, moons: 2, name: "Violet Prime" },
        { color: "rgba(59, 130, 246, 0.3)", ring: false, moons: 0, name: "Cypher" },
        { color: "rgba(167, 139, 250, 0.2)", ring: true, moons: 1, name: "Astra" },
        { color: "rgba(99, 102, 241, 0.4)", ring: false, moons: 3, name: "Nexus" },
        { color: "rgba(236, 72, 153, 0.3)", ring: true, moons: 0, name: "Neon" },
        { color: "rgba(34, 197, 94, 0.2)", ring: false, moons: 1, name: "Veridian" },
    ];

    return (
        <div ref={containerRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
            {/* Cosmic Dust / Nebula Layers */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(76,29,149,0.2),transparent_70%)] opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(30,58,138,0.15),transparent_60%)] opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.1),transparent_50%)] opacity-50" />

            {/* Render Planets */}
            {[...Array(12)].map((_, i) => {
                const style = planetStyles[i % planetStyles.length];
                const sizeBase = gsap.utils.random(30, 70);
                const sizeClass = `w-${Math.floor(sizeBase / 4) * 4} h-${Math.floor(sizeBase / 4) * 4}`;
                
                return (
                    <div key={i} className="planet absolute [perspective:1000px]">
                        <div className="relative flex items-center justify-center">
                            {/* Planet Body */}
                            <div 
                                className="planet-body rounded-full relative overflow-hidden shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.1)]"
                                style={{
                                    width: `${sizeBase * 2}px`,
                                    height: `${sizeBase * 2}px`,
                                    background: `radial-gradient(circle at 30% 30%, ${style.color}, rgba(0,0,0,0.95))`,
                                }}
                            >
                                {/* Surface Detail / Clouds */}
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/granite.png')] mix-blend-overlay rotate-45 scale-150" />
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-screen" />
                            </div>

                            {/* Ring System */}
                            {style.ring && (
                                <div 
                                    className="absolute border-[2px] border-white/10 rounded-[100%] [transform:rotateX(75deg)_rotateY(10deg)]"
                                    style={{
                                        width: "220%",
                                        height: "45%",
                                        boxShadow: "0 0 20px rgba(167, 139, 250, 0.1), inset 0 0 10px rgba(255,255,255,0.05)",
                                        background: "radial-gradient(circle, transparent 60%, rgba(255,255,255,0.02) 100%)",
                                    }}
                                />
                            )}

                            {/* Moons */}
                            {[...Array(style.moons)].map((_, m) => (
                                <div 
                                    key={m}
                                    className="absolute size-4 bg-white/20 rounded-full blur-[1px] shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                                    style={{
                                        transform: `rotate(${m * (360 / style.moons)}deg) translateX(${sizeBase * 1.5}px)`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Hyper-Detailed Starfield */}
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(white_1px,transparent_0)] [background-size:40px_40px]" />
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1.5px,transparent_0)] [background-size:100px_100px]" />
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(rgba(167,139,250,0.8)_2px,transparent_0)] [background-size:250px_250px]" />

            {/* Deep Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
        </div>
    );
};

export default CelestialBackground;
