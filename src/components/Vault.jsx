import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar.jsx";
import Contact from "./Contact.jsx";
import { BentoTilt } from "./Features.jsx";
import gsap from "gsap";
import { IoClose } from "react-icons/io5";
import CelestialBackground from "./CelestialBackground.jsx";

const GAMES = [
    { id: 1, title: "Zigma", category: "Action", image: "/img/gallery-1.webp", description: "The ultimate NFT collection for anime fans. Experience a world where your digital assets come to life and interact across the multiverse.", stats: { rarity: "Mythic", supply: "10,000", vol: "14.2k SOL" } },
    { id: 2, title: "Nexus", category: "Social", image: "/img/gallery-2.webp", description: "Connect with players across the multiverse. A decentralized social layer that bridges the gap between digital identity and physical reality.", stats: { active: "45k", hubs: "1.2k", growth: "+12%" } },
    { id: 3, title: "Azul", category: "RPG", image: "/img/gallery-3.webp", description: "The first AI-powered cross-world agent. Your companion in every adventure, learning from your playstyle and evolving with you.", stats: { brain: "V3", skills: "48", compatibility: "98%" } },
    { id: 4, title: "Prologue", category: "Adventure", image: "/img/gallery-4.webp", description: "Discover the secrets of the hidden realm. A narrative-driven odyssey that challenges everything you know about the Play Economy.", stats: { chapters: "12", secrets: "440", endurance: "24h" } },
    { id: 5, title: "Vault", category: "Strategy", image: "/img/gallery-5.webp", description: "Master the play economy and earn rewards. The financial heart of Zentry, where strategy meets decentralized finance.", stats: { apy: "18.5%", locked: "1.2B", users: "85k" } },
    { id: 6, title: "Radiant", category: "Action", image: "/img/about.webp", description: "Turn your activities into rewarding adventures. Every step you take in the real world fuels your progress in the Metagame.", stats: { impact: "Global", sync: "Real-time", rewards: "XP/ZC" } },
];

const Vault = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [selectedGame, setSelectedGame] = useState(null);
    const containerRef = useRef(null);
    const modalRef = useRef(null);

    const filteredGames = GAMES.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "All" || game.category === filter;
        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(
                ".game-card",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power1.out", overwrite: "auto" }
            );
        }
    }, [filteredGames]);

    useEffect(() => {
        if (selectedGame) {
            document.body.style.overflow = "hidden";
            gsap.fromTo(
                modalRef.current,
                { opacity: 0, scale: 0.8, backdropFilter: "blur(0px)" },
                { opacity: 1, scale: 1, backdropFilter: "blur(10px)", duration: 0.5, ease: "expo.out" }
            );
        } else {
            document.body.style.overflow = "auto";
        }
    }, [selectedGame]);

    const closeModal = () => {
        gsap.to(modalRef.current, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "expo.in",
            onComplete: () => setSelectedGame(null)
        });
    };

    return (
        <div className="min-h-screen bg-black text-blue-50 relative overflow-hidden">
            <Navbar />
            <CelestialBackground />
            
            <div className="container mx-auto px-10 py-32 relative z-10">
                <header className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="special-font font-zentry text-6xl uppercase leading-tight">The Vault</h1>
                        <p className="max-w-lg font-circular-web text-lg opacity-50">
                            Explore our curated collection of multiversal IPs, games, and digital assets.
                        </p>
                    </div>
                </header>

                <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-center">
                    <input 
                        type="text"
                        placeholder="Search games..."
                        className="border-hsla w-full max-w-md rounded-full bg-stone-900 px-6 py-3 text-white outline-none focus:border-blue-50/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    
                    <div className="flex flex-wrap gap-3">
                        {["All", "Action", "Social", "RPG", "Adventure", "Strategy"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`rounded-full px-6 py-2 text-sm uppercase transition-all duration-300 ${
                                    filter === cat ? "bg-blue-50 text-black" : "bg-stone-900 border-hsla hover:bg-stone-800"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div ref={containerRef} className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredGames.length > 0 ? (
                        filteredGames.map((game) => (
                            <BentoTilt 
                                key={game.id} 
                                className="game-card group h-96 cursor-pointer overflow-hidden rounded-md transition-all duration-300"
                            >
                                <div 
                                    onClick={() => setSelectedGame(game)}
                                    className="relative size-full overflow-hidden border-hsla"
                                >
                                    <img 
                                        src={game.image} 
                                        alt={game.title} 
                                        className="absolute left-0 top-0 size-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-6">
                                        <p className="text-xs uppercase text-blue-50/60 mb-1">{game.category}</p>
                                        <h2 className="font-zentry text-3xl uppercase text-white leading-none">{game.title}</h2>
                                    </div>
                                </div>
                            </BentoTilt>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center opacity-30">
                            <p className="font-zentry text-4xl uppercase">No games found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedGame && (
                <div ref={modalRef} className="fixed inset-0 z-[1000] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-stone-900 border-hsla shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-auto max-h-[90vh]">
                        <button 
                            onClick={closeModal}
                            className="absolute right-5 top-5 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white hover:text-black transition-colors"
                        >
                            <IoClose size={24} />
                        </button>

                        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
                            <img src={selectedGame.image} alt={selectedGame.title} className="size-full object-cover" />
                        </div>

                        <div className="w-full md:w-1/2 p-10 flex flex-col">
                            <span className="text-xs uppercase text-violet-300 font-bold mb-2">{selectedGame.category}</span>
                            <h2 className="font-zentry text-5xl uppercase text-white leading-none mb-6">{selectedGame.title}</h2>
                            <p className="font-circular-web text-lg text-blue-50/70 mb-8 italic">
                                "{selectedGame.description}"
                            </p>

                            <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-8 mb-8">
                                {Object.entries(selectedGame.stats).map(([key, val]) => (
                                    <div key={key}>
                                        <p className="text-[10px] uppercase opacity-40 mb-1">{key}</p>
                                        <p className="font-zentry text-xl uppercase text-white">{val}</p>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full bg-blue-50 text-black py-4 font-zentry uppercase text-xl hover:bg-violet-300 transition-colors mt-auto">
                                Initializing Play Loop
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Vault;
