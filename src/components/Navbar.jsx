import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Button from "./Button.jsx";

const navItems = ["Vault", "News", "About", "Contact Us"];

const NavBar = () => {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isIndicatorActive, setIsIndicatorActive] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const audioElementRef = useRef(null);
    const navContainerRef = useRef(null);

    const { y: currentScrollY } = useWindowScroll();
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === "/";

    // Toggle audio
    const toggleAudioIndicator = () => {
        setIsAudioPlaying(prev => !prev);
        setIsIndicatorActive(prev => !prev);
    };

    useEffect(() => {
        if (isAudioPlaying) {
            audioElementRef.current.play();
        } else {
            audioElementRef.current.pause();
        }
    }, [isAudioPlaying]);

    // Load auth user and profile
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);
            if (authUser) {
                const { data } = await supabase
                    .from("profiles")
                    .select("username, xp")
                    .eq("id", authUser.id)
                    .single();
                setProfile(data);
            }
        };
        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("username, xp")
                    .eq("id", session.user.id)
                    .single();
                setProfile(data);
            } else {
                setProfile(null);
            }
        });
        return () => authListener.subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setMenuOpen(false);
        navigate("/");
    };

    // Scroll detection
    useEffect(() => {
        if (currentScrollY === 0) {
            setIsNavVisible(true);
            navContainerRef.current.classList.remove("floating-nav");
        } else if (currentScrollY > lastScrollY) {
            setIsNavVisible(false);
            navContainerRef.current.classList.add("floating-nav");
        } else if (currentScrollY < lastScrollY) {
            setIsNavVisible(true);
            navContainerRef.current.classList.add("floating-nav");
        }
        setLastScrollY(currentScrollY);
    }, [currentScrollY, lastScrollY]);

    useEffect(() => {
        gsap.to(navContainerRef.current, {
            y: isNavVisible ? 0 : -100,
            opacity: isNavVisible ? 1 : 0,
            duration: 0.2,
        });
    }, [isNavVisible]);

    return (
        <div
            ref={navContainerRef}
            className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
        >
            <header className="absolute top-1/2 w-full -translate-y-1/2">
                <nav className="flex size-full items-center justify-between p-4">
                    {/* Logo + Product */}
                    <div className="flex items-center gap-7">
                        <Link to="/">
                            <img src="/img/logo.png" alt="logo" className="w-10" />
                        </Link>
                        <Link to="/vault">
                            <Button
                                id="product-button"
                                title="Products"
                                rightIcon={<TiLocationArrow />}
                                containerClass="bg-blue-50 md:flex hidden items-center justify-center gap-1"
                            />
                        </Link>
                    </div>

                    {/* Nav Links + Auth */}
                    <div className="flex h-full items-center gap-2">
                        <div className="hidden md:flex items-center">
                            {navItems.map((item, index) => {
                                if (item === "Contact Us") {
                                    return (
                                        <Link key={index} to="/contact-us" className="nav-hover-btn">
                                            Contact Us
                                        </Link>
                                    );
                                }
                                const isRoute = ["Vault", "News"].includes(item);
                                return isRoute ? (
                                    <Link key={index} to={`/${item.toLowerCase()}`} className="nav-hover-btn">
                                        {item}
                                    </Link>
                                ) : (
                                    <a
                                        key={index}
                                        href={isHomePage ? `#${item.toLowerCase()}` : `/#${item.toLowerCase()}`}
                                        className="nav-hover-btn"
                                    >
                                        {item}
                                    </a>
                                );
                            })}

                            {/* Auth-aware section */}
                            {user ? (
                                <div className="relative ml-4">
                                    <button
                                        onClick={() => setMenuOpen(prev => !prev)}
                                        className="flex items-center gap-2 rounded-full border border-white/20 bg-stone-900/80 px-4 py-1.5 text-[11px] uppercase font-bold text-white hover:border-violet-400 transition-all"
                                    >
                                        <div className="size-5 rounded-full bg-violet-400 flex items-center justify-center text-black text-[9px] font-black">
                                            {(profile?.username || user.email || "A")[0].toUpperCase()}
                                        </div>
                                        <span>{profile?.username || user.email?.split("@")[0] || "Agent"}</span>
                                        {profile?.xp > 0 && (
                                            <span className="text-yellow-400">{profile.xp} XP</span>
                                        )}
                                    </button>

                                    {menuOpen && (
                                        <div className="absolute right-0 top-10 w-48 bg-stone-900/95 border border-white/10 rounded-2xl p-2 backdrop-blur-xl shadow-2xl z-50">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setMenuOpen(false)}
                                                className="block px-4 py-2 text-[11px] uppercase text-white hover:bg-white/5 rounded-xl transition-colors"
                                            >
                                                Dashboard
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-2 text-[11px] uppercase text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/auth" className="nav-hover-btn ml-2">Login</Link>
                            )}
                        </div>

                        {/* Audio toggle */}
                        <button
                            onClick={toggleAudioIndicator}
                            className="ml-4 flex items-center space-x-0.5"
                        >
                            <audio
                                ref={audioElementRef}
                                className="hidden"
                                src="/audio/loop.mp3"
                                loop
                            />
                            {[1, 2, 3, 4].map((bar) => (
                                <div
                                    key={bar}
                                    className={clsx("indicator-line", { active: isIndicatorActive })}
                                    style={{ animationDelay: `${bar * 0.1}s` }}
                                />
                            ))}
                        </button>
                    </div>
                </nav>
            </header>
        </div>
    );
};

export default NavBar;