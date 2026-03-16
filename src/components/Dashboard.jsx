import { useState, useEffect } from "react";
import Navbar from "./Navbar.jsx";
import Contact from "./Contact.jsx";
import { BentoTilt } from "./Features.jsx";
import Button from "./Button.jsx";
import { TiLocationArrow } from "react-icons/ti";
import AnimatedTitle from "./AnimatedTitle.jsx";
import CelestialBackground from "./CelestialBackground.jsx";

const LEADERBOARD_DATA = [
    { rank: 1, name: "NeonX", xp: "142.5k", tier: "Grandmaster" },
    { rank: 2, name: "Cypher", xp: "128.9k", tier: "Grandmaster" },
    { rank: 3, name: "Astra", xp: "115.2k", tier: "Master" },
    { rank: 4, name: "Ghost", xp: "98.4k", tier: "Master" },
    { rank: 5, name: "Zentry_Bot", xp: "85.1k", tier: "Elite" },
];

const Dashboard = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("zentry-user");
        return saved ? JSON.parse(saved) : { name: "Ishan", rank: "Master", avatar: "/img/swordman.webp" };
    });

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.name);

    useEffect(() => {
        localStorage.setItem("zentry-user", JSON.stringify(user));
    }, [user]);

    const handleSave = () => {
        setUser({ ...user, name: newName });
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-black text-blue-50 relative overflow-hidden">
            <Navbar />
            <CelestialBackground />
            
            <div className="container mx-auto px-10 py-32 relative z-10">
                <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-8">
                        <div className="size-32 overflow-hidden rounded-full border-4 border-violet-300">
                            <img src={user.avatar} alt="avatar" className="size-full object-cover" />
                        </div>
                        <div>
                            {isEditing ? (
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="text" 
                                        value={newName} 
                                        onChange={(e) => setNewName(e.target.value)} 
                                        className="bg-transparent border-b border-blue-50 text-4xl font-zentry uppercase outline-none"
                                    />
                                    <button onClick={handleSave} className="text-xs uppercase bg-blue-50 text-black px-4 py-1 rounded-full">Save</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <h1 className="special-font font-zentry text-6xl uppercase leading-none">{user.name}</h1>
                                    <button onClick={() => setIsEditing(true)} className="text-[10px] uppercase opacity-40 hover:opacity-100 transition-opacity">Edit</button>
                                </div>
                            )}
                            <p className="mt-2 font-circular-web text-lg text-violet-300 font-bold uppercase tracking-widest">{user.rank} Level</p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-7 md:grid-cols-4 md:grid-rows-2 h-auto md:h-[80vh]">
                    <BentoTilt className="border-hsla md:col-span-2 md:row-span-2 rounded-3xl bg-stone-900/30 backdrop-blur-xl p-10 flex flex-col justify-between group overflow-hidden">
                        <div className="relative z-10">
                            <p className="font-zentry text-xs uppercase opacity-50 mb-4">Current Progress</p>
                            <AnimatedTitle 
                                title="Your Play <br /> Journey"
                                containerClass="!text-white !text-6xl !text-left"
                            />
                        </div>
                        <div className="mt-10 relative z-10">
                            <div className="flex justify-between text-xs uppercase mb-2">
                                <span>Master Rank Progress</span>
                                <span className="text-violet-300 font-bold">74%</span>
                            </div>
                            <div className="h-3 w-full bg-stone-800/50 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-violet-600 to-violet-300 w-[74%] shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                            </div>
                            <p className="mt-4 text-xs opacity-50 font-circular-web">Earn 2,500 more XP to unlock 'Grandmaster' tier.</p>
                        </div>
                        {/* 3D Decorative Sphere */}
                        <div className="absolute -right-20 -bottom-20 size-64 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all duration-700" />
                    </BentoTilt>

                    <BentoTilt className="border-hsla md:col-span-2 rounded-3xl bg-stone-900/30 backdrop-blur-xl p-10 flex items-center justify-between group">
                        <div>
                            <p className="font-zentry text-xs uppercase opacity-50 mb-2">Total Earnings</p>
                            <h3 className="font-zentry text-5xl uppercase text-white group-hover:text-violet-300 transition-colors">12.5k XP</h3>
                        </div>
                        <div className="text-right">
                            <p className="font-zentry text-xs uppercase opacity-50 mb-2">Global Rank</p>
                            <h3 className="font-zentry text-5xl uppercase text-violet-300 shadow-[0_0_20px_rgba(167,139,250,0.3)]">#1,284</h3>
                        </div>
                    </BentoTilt>

                    <BentoTilt className="border-hsla md:col-span-2 rounded-3xl bg-stone-900/30 backdrop-blur-xl p-10 flex flex-col group">
                        <h3 className="font-zentry text-3xl uppercase mb-6 text-white group-hover:text-violet-300 transition-colors">Global Leaderboard</h3>
                        <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar relative z-10">
                            {LEADERBOARD_DATA.map((p) => (
                                <div key={p.rank} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="opacity-40 font-zentry">#{p.rank}</span>
                                        <span className="font-bold uppercase tracking-widest">{p.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-violet-300 font-bold">{p.xp} XP</p>
                                        <p className="text-[10px] uppercase opacity-30">{p.tier}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BentoTilt>
                </div>

                <div className="mt-32">
                    <h2 className="font-zentry text-4xl uppercase mb-10">Recently Played</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border-hsla aspect-video rounded-md bg-stone-900 overflow-hidden relative group cursor-pointer">
                                <img src={`/img/gallery-${i}.webp`} className="size-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-50" />
                                <div className="absolute inset-0 flex flex-center">
                                    <TiLocationArrow className="scale-0 group-hover:scale-150 transition-transform duration-300 text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
