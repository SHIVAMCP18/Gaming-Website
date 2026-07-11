import { useState, useEffect, useRef } from "react";
import Navbar from "./Navbar.jsx";
import Contact from "./Contact.jsx";
import { BentoTilt } from "./Features.jsx";
import { TiLocationArrow } from "react-icons/ti";
import AnimatedTitle from "./AnimatedTitle.jsx";
import CelestialBackground from "./CelestialBackground.jsx";
import {
    supabase,
    getProfile,
    getLeaderboard,
    getTier,
    getTierProgress,
} from "../lib/supabaseClient";
import gsap from "gsap";

const FALLBACK_USER = {
    username: "Ishan",
    xp: 12500,
    avatar: "/img/swordman.webp",
    inventory: [],
    completed_quests: [],
};

const FALLBACK_LEADERBOARD = [
    { rank: 1, username: "NeonX",       xp: 142500 },
    { rank: 2, username: "Cypher",      xp: 128900 },
    { rank: 3, username: "Astra",       xp: 115200 },
    { rank: 4, username: "Ghost",       xp: 98400  },
    { rank: 5, username: "Zentry_Bot",  xp: 85100  },
];

const INVENTORY_ITEMS = [
    { id: "chronos-key",    name: "Chronos Key",   rarity: "Epic",     img: "/img/gallery-1.webp" },
    { id: "nexus-sigil",    name: "Nexus Sigil",   rarity: "Rare",     img: "/img/gallery-2.webp" },
    { id: "shadow-shard",   name: "Shadow Shard",  rarity: "Common",   img: "/img/gallery-3.webp" },
    { id: "void-prism",     name: "Void Prism",    rarity: "Multiverse", img: "/img/gallery-4.webp" },
];

const rarityColors = {
    "Common":     "border-white/20 text-white/60",
    "Rare":       "border-blue-400/60 text-blue-300",
    "Epic":       "border-violet-400/60 text-violet-300",
    "Multiverse": "border-yellow-400/60 text-yellow-300",
};

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [user, setUser] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("progress");

    const xpBarRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);

            let profileData = null;
            if (authUser) {
                profileData = await getProfile(authUser.id);
            }
            setProfile(profileData || { ...FALLBACK_USER });
            setNewName(profileData?.username || FALLBACK_USER.username);

            // Load leaderboard
            const lb = await getLeaderboard();
            setLeaderboard(lb.length > 0 ? lb : FALLBACK_LEADERBOARD.map(x => ({ username: x.username, xp: x.xp })));

            setLoading(false);
        };
        load();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const profileData = await getProfile(session.user.id);
                setProfile(profileData || { ...FALLBACK_USER });
                setNewName(profileData?.username || FALLBACK_USER.username);
            } else {
                setProfile({ ...FALLBACK_USER });
            }
        });
        return () => authListener.subscription.unsubscribe();
    }, []);

    // Animate XP bar on load
    useEffect(() => {
        if (!loading && xpBarRef.current && profile) {
            const pct = getTierProgress(profile.xp || 0).percent;
            gsap.fromTo(xpBarRef.current,
                { width: "0%" },
                { width: `${pct}%`, duration: 1.5, ease: "power2.out", delay: 0.3 }
            );
        }
    }, [loading, profile]);

    const handleSave = async () => {
        if (!user) return;
        await supabase
            .from("profiles")
            .update({ username: newName, updated_at: new Date().toISOString() })
            .eq("id", user.id);
        setProfile(prev => ({ ...prev, username: newName }));
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="font-zentry text-2xl uppercase text-white/30 animate-pulse">Loading Profile...</div>
            </div>
        );
    }

    const xp = profile?.xp || 0;
    const tier = getTier(xp);
    const tierProgress = getTierProgress(xp);
    const displayName = profile?.username || "Agent";
    const inventory = profile?.inventory || [];
    const completedQuests = profile?.completed_quests || [];

    return (
        <div className="min-h-screen bg-black text-blue-50 relative overflow-hidden">
            <Navbar />
            <CelestialBackground />

            <div className="container mx-auto px-6 md:px-10 py-32 relative z-10">

                {/* ─── Header ──────────────────────────────────── */}
                <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center mb-20">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-violet-500/40 rounded-full blur-xl scale-125" />
                            <div className="size-32 overflow-hidden rounded-full border-4 border-violet-400/60 relative z-10">
                                <img src={profile?.avatar || "/img/swordman.webp"} alt="avatar" className="size-full object-cover" />
                            </div>
                        </div>
                        <div>
                            {isEditing ? (
                                <div className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="bg-transparent border-b border-blue-50 text-4xl font-zentry uppercase outline-none"
                                        onKeyDown={e => e.key === "Enter" && handleSave()}
                                    />
                                    <button onClick={handleSave} className="text-xs uppercase bg-blue-50 text-black px-4 py-1 rounded-full">
                                        Save
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="text-xs uppercase opacity-40">
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <h1 className="special-font font-zentry text-6xl uppercase leading-none">{displayName}</h1>
                                    {user && (
                                        <button onClick={() => setIsEditing(true)} className="text-[10px] uppercase opacity-40 hover:opacity-100 transition-opacity">
                                            Edit
                                        </button>
                                    )}
                                </div>
                            )}
                            <p className="mt-2 font-circular-web text-lg text-violet-300 font-bold uppercase tracking-widest">
                                {tier} · {xp.toLocaleString()} XP
                            </p>
                            {!user && (
                                <p className="text-[10px] uppercase text-yellow-400/60 mt-1">
                                    ⚠ Sign in to save progress
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6">
                        {[
                            { label: "Quests Done", value: completedQuests.length },
                            { label: "Items Owned", value: inventory.length },
                            { label: "Tier", value: tier },
                        ].map(stat => (
                            <div key={stat.label} className="text-center border border-white/5 rounded-2xl px-6 py-4 bg-stone-900/40 backdrop-blur-sm">
                                <p className="font-zentry text-3xl uppercase text-white">{stat.value}</p>
                                <p className="text-[10px] uppercase opacity-40 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── Bento Grid ──────────────────────────────── */}
                <div className="grid grid-cols-1 gap-7 md:grid-cols-4 md:grid-rows-2 h-auto md:h-[80vh]">

                    {/* Play Journey / XP Progress */}
                    <BentoTilt className="border-hsla md:col-span-2 md:row-span-2 rounded-3xl bg-stone-900/30 backdrop-blur-xl p-10 flex flex-col justify-between group overflow-hidden">
                        <div className="relative z-10">
                            <p className="font-zentry text-xs uppercase opacity-50 mb-4">Current Progress</p>
                            <AnimatedTitle
                                title="Your Play <br /> Journey"
                                containerClass="!text-white !text-6xl !text-left"
                            />
                        </div>
                        <div className="mt-10 relative z-10 space-y-6">
                            {/* XP Bar */}
                            <div>
                                <div className="flex justify-between text-xs uppercase mb-2">
                                    <span>{tier} Rank Progress</span>
                                    <span className="text-violet-300 font-bold">{tierProgress.percent}%</span>
                                </div>
                                <div className="h-3 w-full bg-stone-800/50 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        ref={xpBarRef}
                                        className="h-full bg-gradient-to-r from-violet-600 to-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                                        style={{ width: "0%" }}
                                    />
                                </div>
                                <p className="mt-3 text-xs opacity-50 font-circular-web">
                                    {tierProgress.remaining.toLocaleString()} more XP to unlock '{getTier(tierProgress.next)}' tier.
                                </p>
                            </div>
                            {/* Recent Activity */}
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase opacity-40">Recent Activity</p>
                                {completedQuests.length > 0 ? completedQuests.slice(-3).map(qId => (
                                    <div key={qId} className="flex items-center gap-2 text-xs">
                                        <div className="size-1.5 rounded-full bg-green-400" />
                                        <span className="opacity-60">Quest #{qId} Secured</span>
                                    </div>
                                )) : (
                                    <p className="text-xs opacity-30">No quests completed yet.</p>
                                )}
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 size-64 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700" />
                    </BentoTilt>

                    {/* XP / Rank */}
                    <BentoTilt className="border-hsla md:col-span-2 rounded-3xl bg-stone-900/30 backdrop-blur-xl p-10 flex items-center justify-between group">
                        <div>
                            <p className="font-zentry text-xs uppercase opacity-50 mb-2">Total XP</p>
                            <h3 className="font-zentry text-5xl uppercase text-white group-hover:text-violet-300 transition-colors">
                                {xp.toLocaleString()}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="font-zentry text-xs uppercase opacity-50 mb-2">Tier</p>
                            <h3 className="font-zentry text-5xl uppercase text-violet-300 shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                                {tier}
                            </h3>
                        </div>
                    </BentoTilt>

                    {/* Global Leaderboard */}
                    <BentoTilt className="border-hsla md:col-span-2 rounded-3xl bg-stone-900/30 backdrop-blur-xl p-10 flex flex-col group">
                        <h3 className="font-zentry text-3xl uppercase mb-6 text-white group-hover:text-violet-300 transition-colors">
                            Global Leaderboard
                        </h3>
                        <div className="space-y-3 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar relative z-10">
                            {leaderboard.map((p, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0 px-2 rounded-sm transition-colors ${
                                        p.username === displayName ? "bg-violet-500/10 border-violet-400/20" : "hover:bg-white/5"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`font-zentry w-6 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-white/60" : i === 2 ? "text-amber-600" : "opacity-40"}`}>
                                            #{i + 1}
                                        </span>
                                        <span className="font-bold uppercase tracking-widest">
                                            {p.username}
                                            {p.username === displayName && <span className="text-violet-300 text-[9px] ml-1">YOU</span>}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-violet-300 font-bold">{(p.xp || 0).toLocaleString()} XP</p>
                                        <p className="text-[10px] uppercase opacity-30">{getTier(p.xp || 0)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BentoTilt>
                </div>

                {/* ─── Inventory Section ───────────────────────── */}
                <div className="mt-32">
                    <div className="flex items-end justify-between mb-10">
                        <h2 className="font-zentry text-4xl uppercase">Inventory</h2>
                        <p className="text-[11px] uppercase opacity-40">
                            {inventory.length} / ∞ Items
                        </p>
                    </div>
                    {inventory.length === 0 ? (
                        <div className="border border-white/5 rounded-3xl p-20 text-center bg-stone-900/20">
                            <p className="font-zentry text-3xl uppercase opacity-20 mb-4">Vault Empty</p>
                            <p className="text-sm opacity-30 font-circular-web">
                                Open Celestial Chests in the Vault to collect items.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {inventory.map((item, i) => {
                                const rarity = rarityColors[item.rarity] || rarityColors["Common"];
                                return (
                                    <div
                                        key={i}
                                        className={`group border rounded-2xl overflow-hidden bg-stone-900/40 backdrop-blur-sm hover:scale-105 transition-transform duration-300 ${rarity}`}
                                    >
                                        <div className="aspect-square overflow-hidden">
                                            <img
                                                src={item.img || "/img/gallery-1.webp"}
                                                alt={item.name}
                                                className="size-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300 scale-110"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <p className="font-zentry text-sm uppercase">{item.name}</p>
                                            <p className={`text-[10px] uppercase font-bold mt-1 ${rarity.split(" ")[1]}`}>{item.rarity}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ─── Recently Played ─────────────────────────── */}
                <div className="mt-20">
                    <h2 className="font-zentry text-4xl uppercase mb-10">Recently Played</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border-hsla aspect-video rounded-md bg-stone-900 overflow-hidden relative group cursor-pointer">
                                <img
                                    src={`/img/gallery-${i}.webp`}
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-50"
                                    alt={`game-${i}`}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <TiLocationArrow className="scale-0 group-hover:scale-150 transition-transform duration-300 text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <Contact />
        </div>
    );
};

export default Dashboard;
