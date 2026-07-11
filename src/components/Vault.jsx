import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "./Navbar.jsx";
import Contact from "./Contact.jsx";
import { BentoTilt } from "./Features.jsx";
import gsap from "gsap";
import { IoClose } from "react-icons/io5";
import { TiLocationArrow } from "react-icons/ti";
import CelestialBackground from "./CelestialBackground.jsx";
import { supabase, addXP, addToInventory, getProfile } from "../lib/supabaseClient";

// ─── Game Catalog Data ────────────────────────────────────────────────────────
const GAMES = [
    { id: 1, title: "Zigma", category: "Action", image: "/img/gallery-1.webp", description: "The ultimate NFT collection for anime fans. Experience a world where your digital assets come to life and interact across the multiverse.", stats: { rarity: "Mythic", supply: "10,000", vol: "14.2k SOL" } },
    { id: 2, title: "Nexus", category: "Social", image: "/img/gallery-2.webp", description: "Connect with players across the multiverse. A decentralized social layer that bridges the gap between digital identity and physical reality.", stats: { active: "45k", hubs: "1.2k", growth: "+12%" } },
    { id: 3, title: "Azul", category: "RPG", image: "/img/gallery-3.webp", description: "The first AI-powered cross-world agent. Your companion in every adventure, learning from your playstyle and evolving with you.", stats: { brain: "V3", skills: "48", compatibility: "98%" } },
    { id: 4, title: "Prologue", category: "Adventure", image: "/img/gallery-4.webp", description: "Discover the secrets of the hidden realm. A narrative-driven odyssey that challenges everything you know about the Play Economy.", stats: { chapters: "12", secrets: "440", endurance: "24h" } },
    { id: 5, title: "Vault", category: "Strategy", image: "/img/gallery-5.webp", description: "Master the play economy and earn rewards. The financial heart of Zentry, where strategy meets decentralized finance.", stats: { apy: "18.5%", locked: "1.2B", users: "85k" } },
    { id: 6, title: "Radiant", category: "Action", image: "/img/about.webp", description: "Turn your activities into rewarding adventures. Every step you take in the real world fuels your progress in the Metagame.", stats: { impact: "Global", sync: "Real-time", rewards: "XP/ZC" } },
];

// ─── Lootbox Config ───────────────────────────────────────────────────────────
const CHESTS = [
    {
        id: "common",
        name: "Celestial Chest",
        tier: "Common",
        cost: 50,
        color: "from-slate-600 to-slate-800",
        glow: "rgba(148,163,184,0.4)",
        border: "border-slate-400/30",
        emoji: "📦",
        description: "A basic loot chest with modest rewards.",
        pool: [
            { id: "shadow-shard", name: "Shadow Shard", rarity: "Common", img: "/img/gallery-3.webp", xp: 30 },
            { id: "star-dust", name: "Star Dust", rarity: "Common", img: "/img/gallery-4.webp", xp: 25 },
            { id: "zentry-coin", name: "Zentry Coin", rarity: "Common", img: "/img/gallery-5.webp", xp: 40 },
        ],
    },
    {
        id: "epic",
        name: "Nexus Chest",
        tier: "Epic",
        cost: 100,
        color: "from-violet-700 to-purple-900",
        glow: "rgba(139,92,246,0.5)",
        border: "border-violet-400/40",
        emoji: "💜",
        description: "An epic chest containing rare multiversal artifacts.",
        pool: [
            { id: "nexus-sigil", name: "Nexus Sigil", rarity: "Rare", img: "/img/gallery-2.webp", xp: 100 },
            { id: "void-crystal", name: "Void Crystal", rarity: "Epic", img: "/img/gallery-1.webp", xp: 150 },
            { id: "ghost-blade", name: "Ghost Blade", rarity: "Epic", img: "/img/gallery-5.webp", xp: 175 },
        ],
    },
    {
        id: "multiverse",
        name: "Multiverse Chest",
        tier: "Multiverse",
        cost: 250,
        color: "from-yellow-500 via-orange-600 to-red-700",
        glow: "rgba(234,179,8,0.6)",
        border: "border-yellow-400/50",
        emoji: "⚡",
        description: "The rarest chest — contains legendary multiverse items.",
        pool: [
            { id: "chronos-key", name: "Chronos Key", rarity: "Multiverse", img: "/img/gallery-1.webp", xp: 300 },
            { id: "void-prism", name: "Void Prism", rarity: "Multiverse", img: "/img/about.webp", xp: 350 },
            { id: "zentry-shard", name: "Zentry Shard", rarity: "Multiverse", img: "/img/gallery-2.webp", xp: 400 },
        ],
    },
];

const rarityStyles = {
    Common:     { border: "border-slate-400/40",  text: "text-slate-300",   glow: "shadow-[0_0_20px_rgba(148,163,184,0.3)]" },
    Rare:       { border: "border-blue-400/50",   text: "text-blue-300",    glow: "shadow-[0_0_20px_rgba(96,165,250,0.4)]" },
    Epic:       { border: "border-violet-400/60", text: "text-violet-300",  glow: "shadow-[0_0_30px_rgba(139,92,246,0.5)]" },
    Multiverse: { border: "border-yellow-400/70", text: "text-yellow-300",  glow: "shadow-[0_0_40px_rgba(234,179,8,0.6)]" },
};

// ─── Canvas Particle Burst ───────────────────────────────────────────────────
const ParticleBurst = ({ active, color = "#a78bfa" }) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        particlesRef.current = Array.from({ length: 80 }, () => ({
            x: cx, y: cy,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1,
            size: Math.random() * 4 + 2,
            color,
        }));

        let frame;
        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // gravity
                p.life -= 0.018;
                ctx.globalAlpha = Math.max(p.life, 0);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            });
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);
            if (particlesRef.current.length > 0) {
                frame = requestAnimationFrame(tick);
            }
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [active, color]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
        />
    );
};

// ─── Lootbox Section ─────────────────────────────────────────────────────────
const LootboxSection = () => {
    const [userXP, setUserXP] = useState(0);
    const [userId, setUserId] = useState(null);
    const [openingChest, setOpeningChest] = useState(null);
    const [revealedItem, setRevealedItem] = useState(null);
    const [particleColor, setParticleColor] = useState("#a78bfa");
    const [opening, setOpening] = useState(false);
    const [history, setHistory] = useState([]);

    const chestRefs = useRef({});
    const revealRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const profile = await getProfile(user.id);
                if (profile) setUserXP(profile.xp || 0);
            } else {
                // LocalStorage XP for guests
                const localXP = parseInt(localStorage.getItem("zentry-xp") || "500", 10);
                setUserXP(localXP);
            }
        };
        init();
    }, []);

    const saveXP = (newXP) => {
        setUserXP(newXP);
        if (!userId) localStorage.setItem("zentry-xp", String(newXP));
    };

    const openChest = useCallback(async (chest) => {
        if (opening) return;
        if (userXP < chest.cost) return;
        setOpening(true);
        setOpeningChest(chest.id);
        setRevealedItem(null);

        const el = chestRefs.current[chest.id];

        // Phase 1: Shake
        await gsap.to(el, {
            keyframes: [
                { x: -8, rotation: -5, duration: 0.08 },
                { x: 8, rotation: 5, duration: 0.08 },
                { x: -6, rotation: -4, duration: 0.08 },
                { x: 6, rotation: 4, duration: 0.08 },
                { x: 0, rotation: 0, duration: 0.08 },
            ],
        });

        // Phase 2: Scale + glow
        await gsap.to(el, {
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out",
        });
        await gsap.to(el, {
            scale: 1,
            duration: 0.2,
            ease: "power2.in",
        });

        // Pick random item
        const item = chest.pool[Math.floor(Math.random() * chest.pool.length)];
        const newXP = userXP - chest.cost + item.xp;
        saveXP(newXP);

        // Sync to DB or local
        if (userId) {
            await addXP(userId, item.xp - chest.cost);
            await addToInventory(userId, item);
        }

        // Particle color based on tier
        const colors = {
            Common: "#94a3b8",
            Rare: "#60a5fa",
            Epic: "#a78bfa",
            Multiverse: "#fbbf24",
        };
        setParticleColor(colors[item.rarity] || "#a78bfa");
        setRevealedItem(item);
        setHistory(prev => [{ ...item, chestTier: chest.tier, timestamp: Date.now() }, ...prev].slice(0, 10));

        // Animate reveal panel
        setTimeout(() => {
            if (revealRef.current) {
                gsap.fromTo(revealRef.current,
                    { opacity: 0, scale: 0.7, y: 40 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
                );
            }
            setOpening(false);
        }, 200);
    }, [opening, userXP, userId]);

    const rStyle = revealedItem ? rarityStyles[revealedItem.rarity] : null;

    return (
        <div>
            {/* XP Bar */}
            <div className="mb-12 flex items-center justify-between p-6 rounded-2xl bg-stone-900/50 border border-white/5 backdrop-blur-sm">
                <div>
                    <p className="text-[10px] uppercase font-bold text-violet-300 tracking-widest mb-1">Available XP</p>
                    <p className="font-zentry text-4xl uppercase text-white">{userXP.toLocaleString()} <span className="text-yellow-400">XP</span></p>
                </div>
                {!userId && (
                    <p className="text-[11px] text-yellow-400/60 uppercase">Guest Mode — Sign in to save progress</p>
                )}
            </div>

            {/* Chest Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {CHESTS.map(chest => {
                    const canAfford = userXP >= chest.cost;
                    return (
                        <div
                            key={chest.id}
                            ref={el => chestRefs.current[chest.id] = el}
                            className={`relative group overflow-hidden rounded-3xl border ${chest.border} bg-gradient-to-b ${chest.color} p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
                                canAfford ? "hover:scale-105" : "opacity-50 cursor-not-allowed"
                            }`}
                            style={{ boxShadow: canAfford ? `0 0 40px ${chest.glow}` : "none" }}
                        >
                            {openingChest === chest.id && <ParticleBurst active={opening} color={particleColor} />}

                            {/* Chest Icon */}
                            <div className="text-7xl mb-6 select-none" style={{ filter: `drop-shadow(0 0 20px ${chest.glow})` }}>
                                {chest.emoji}
                            </div>

                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-1">
                                {chest.tier}
                            </span>
                            <h3 className="font-zentry text-3xl uppercase text-white mb-3">{chest.name}</h3>
                            <p className="text-sm text-white/50 font-circular-web mb-8">{chest.description}</p>

                            <button
                                onClick={() => canAfford && openChest(chest)}
                                disabled={!canAfford || opening}
                                className={`w-full py-3 rounded-xl font-zentry text-sm uppercase tracking-widest transition-all duration-300 ${
                                    canAfford && !opening
                                        ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40"
                                        : "bg-white/5 text-white/30 border border-white/5"
                                }`}
                            >
                                {canAfford ? `Open · ${chest.cost} XP` : `Need ${chest.cost} XP`}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Reveal Modal */}
            {revealedItem && (
                <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div
                        ref={revealRef}
                        className={`relative w-80 rounded-3xl border ${rStyle.border} ${rStyle.glow} bg-stone-900/95 p-8 text-center overflow-hidden`}
                    >
                        <ParticleBurst active={true} color={particleColor} />
                        <button
                            onClick={() => setRevealedItem(null)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white"
                        >
                            <IoClose size={20} />
                        </button>

                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-4">You got</p>

                        <div className="mx-auto size-40 rounded-2xl overflow-hidden border-2 border-white/10 mb-6">
                            <img src={revealedItem.img} alt={revealedItem.name} className="size-full object-cover" />
                        </div>

                        <h3 className="font-zentry text-3xl uppercase text-white mb-2">{revealedItem.name}</h3>
                        <p className={`text-sm font-bold uppercase tracking-widest ${rStyle.text} mb-4`}>{revealedItem.rarity}</p>
                        <p className="text-yellow-400 font-zentry text-2xl">+{revealedItem.xp} XP</p>

                        <button
                            onClick={() => setRevealedItem(null)}
                            className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-zentry text-sm uppercase transition-all"
                        >
                            Claim
                        </button>
                    </div>
                </div>
            )}

            {/* Drop History */}
            {history.length > 0 && (
                <div>
                    <h3 className="font-zentry text-2xl uppercase mb-6 opacity-50">Recent Drops</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {history.map((item, i) => {
                            const s = rarityStyles[item.rarity];
                            return (
                                <div key={i} className={`border ${s.border} rounded-2xl overflow-hidden bg-stone-900/40 text-center`}>
                                    <div className="aspect-square overflow-hidden">
                                        <img src={item.img} alt={item.name} className="size-full object-cover opacity-70" />
                                    </div>
                                    <div className="p-3">
                                        <p className="font-zentry text-[11px] uppercase">{item.name}</p>
                                        <p className={`text-[9px] uppercase font-bold mt-0.5 ${s.text}`}>{item.rarity}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Vault Component ─────────────────────────────────────────────────────
const Vault = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [selectedGame, setSelectedGame] = useState(null);
    const [activeTab, setActiveTab] = useState("catalog");
    const containerRef = useRef(null);
    const modalRef = useRef(null);

    const filteredGames = GAMES.filter(game => {
        const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "All" || game.category === filter;
        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        if (containerRef.current && activeTab === "catalog") {
            gsap.fromTo(
                ".game-card",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power1.out", overwrite: "auto" }
            );
        }
    }, [filteredGames, activeTab]);

    useEffect(() => {
        if (selectedGame) {
            document.body.style.overflow = "hidden";
            gsap.fromTo(
                modalRef.current,
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }
            );
        } else {
            document.body.style.overflow = "auto";
        }
    }, [selectedGame]);

    const closeModal = () => {
        gsap.to(modalRef.current, {
            opacity: 0, scale: 0.8, duration: 0.3, ease: "expo.in",
            onComplete: () => setSelectedGame(null)
        });
    };

    return (
        <div className="min-h-screen bg-black text-blue-50 relative overflow-hidden">
            <Navbar />
            <CelestialBackground />

            <div className="container mx-auto px-6 md:px-10 py-32 relative z-10">
                <header className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center mb-12">
                    <div>
                        <h1 className="special-font font-zentry text-6xl uppercase leading-tight">The Vault</h1>
                        <p className="max-w-lg font-circular-web text-lg opacity-50">
                            Explore games, open Celestial Chests, and build your collection.
                        </p>
                    </div>
                </header>

                {/* Tab Bar */}
                <div className="flex gap-2 mb-12 border-b border-white/10">
                    {[
                        { id: "catalog", label: "Game Catalog", icon: "🎮" },
                        { id: "lootbox", label: "Celestial Chests", icon: "⚡" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-4 font-zentry text-sm uppercase tracking-widest transition-all duration-300 border-b-2 -mb-px ${
                                activeTab === tab.id
                                    ? "border-violet-400 text-white"
                                    : "border-transparent text-white/40 hover:text-white/70"
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── Catalog Tab ─── */}
                {activeTab === "catalog" && (
                    <>
                        <div className="flex flex-col gap-6 md:flex-row md:items-center mb-12">
                            <input
                                type="text"
                                placeholder="Search games..."
                                className="border-hsla w-full max-w-md rounded-full bg-stone-900 px-6 py-3 text-white outline-none"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <div className="flex flex-wrap gap-3">
                                {["All", "Action", "Social", "RPG", "Adventure", "Strategy"].map(cat => (
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

                        <div ref={containerRef} className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredGames.length > 0 ? (
                                filteredGames.map(game => (
                                    <BentoTilt
                                        key={game.id}
                                        className="game-card group h-96 cursor-pointer overflow-hidden rounded-md transition-all duration-300"
                                    >
                                        <div onClick={() => setSelectedGame(game)} className="relative size-full overflow-hidden border-hsla">
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
                    </>
                )}

                {/* ─── Lootbox Tab ─── */}
                {activeTab === "lootbox" && <LootboxSection />}

            </div>

            {/* Game Detail Modal */}
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

            <Contact />
        </div>
    );
};

export default Vault;
