import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const CustomCursor = () => {
    const cursorRef = useRef(null);
    const followerRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const trailRefs = useRef([]);

    useEffect(() => {
        const cursor = cursorRef.current;
        const follower = followerRef.current;
        const trails = trailRefs.current;

        const onMouseMove = (e) => {
            const { clientX, clientY } = e;
            
            gsap.to(cursor, {
                x: clientX,
                y: clientY,
                duration: 0.1,
                ease: "power2.out",
            });

            gsap.to(follower, {
                x: clientX,
                y: clientY,
                duration: 0.3,
                ease: "power2.out",
            });

            trails.forEach((trail, index) => {
                gsap.to(trail, {
                    x: clientX,
                    y: clientY,
                    duration: 0.4 + index * 0.05,
                    ease: "power3.out",
                });
            });
        };

        const onMouseEnter = (e) => {
            const target = e.target;
            if (target.closest("button, a, .cursor-pointer")) {
                setIsHovering(true);
            }
        };

        const onMouseLeave = () => {
            setIsHovering(false);
        };

        window.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseover", onMouseEnter);
        document.addEventListener("mouseout", onMouseLeave);

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseover", onMouseEnter);
            document.removeEventListener("mouseout", onMouseLeave);
        };
    }, []);

    useEffect(() => {
        const follower = followerRef.current;
        const cursor = cursorRef.current;
        const trails = trailRefs.current;

        if (isHovering) {
            gsap.to(follower, {
                scale: 2.5,
                backgroundColor: "rgba(167, 139, 250, 0.3)",
                borderColor: "rgba(167, 139, 250, 0.8)",
                duration: 0.3,
            });
            gsap.to(cursor, {
                scale: 0.5,
                opacity: 0.5,
                duration: 0.3,
            });
            trails.forEach((trail) => {
                gsap.to(trail, { opacity: 0, duration: 0.2 });
            });
        } else {
            gsap.to(follower, {
                scale: 1,
                backgroundColor: "transparent",
                borderColor: "rgba(255, 255, 255, 0.5)",
                duration: 0.3,
            });
            gsap.to(cursor, {
                scale: 1,
                opacity: 1,
                duration: 0.3,
            });
            trails.forEach((trail) => {
                gsap.to(trail, { opacity: 0.4, duration: 0.2 });
            });
        }
    }, [isHovering]);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference hidden md:block">
            {/* Trail particles */}
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    ref={(el) => (trailRefs.current[i] = el)}
                    className="fixed size-2 rounded-full bg-violet-300/40 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        scale: 1 - i * 0.1,
                        opacity: 0.4 - i * 0.05,
                    }}
                />
            ))}
            
            <div
                ref={cursorRef}
                className="fixed size-3 rounded-full bg-violet-300 -translate-x-1/2 -translate-y-1/2"
            />
            <div
                ref={followerRef}
                className="fixed size-8 rounded-full border border-white/50 -translate-x-1/2 -translate-y-1/2"
            />
        </div>
    );
};

export default CustomCursor;
