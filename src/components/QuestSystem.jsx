import { useState, useEffect, useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { supabase, addXP, completeQuest } from "../lib/supabaseClient";

const QUESTS_CONFIG = [
    { id: 1, title: "Explorer",  desc: "Visit the Vault",        path: "/vault",     xp: 50  },
    { id: 2, title: "Stalker",   desc: "View User Dashboard",    path: "/dashboard", xp: 50  },
    { id: 3, title: "Reader",    desc: "Check Latest News",      path: "/news",      xp: 100 },
];

const STORAGE_KEY = "zentry-quests-v2";

const QuestSystem = () => {
    const location = useLocation();
    const [userId, setUserId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [notif, setNotif] = useState(null);
    const [totalXP, setTotalXP] = useState(0);

    // Load quest state from localStorage (with optional DB sync)
    const [quests, setQuests] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved) return saved;
        } catch (_) {}
        return QUESTS_CONFIG.map(q => ({ ...q, completed: false }));
    });

    const menuRef = useRef(null);

    // Persist quest state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
        const earned = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xp, 0);
        setTotalXP(earned);
    }, [quests]);

    // Get logged-in user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) setUserId(data.user.id);
        });
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id ?? null);
        });
        return () => authListener.subscription.unsubscribe();
    }, []);

    // Track page visits and award XP
    useEffect(() => {
        const path = location.pathname;
        const match = QUESTS_CONFIG.find(q => q.path === path);
        if (!match) return;

        setQuests(prev => prev.map(q => {
            if (q.id === match.id && !q.completed) {
                // Show notification
                setNotif({ title: q.title, xp: q.xp });
                setTimeout(() => setNotif(null), 3500);

                // Sync to DB if logged in
                if (userId) {
                    addXP(userId, q.xp);
                    completeQuest(userId, q.id);
                }

                return { ...q, completed: true };
            }
            return q;
        }));
    }, [location.pathname, userId]);

    // GSAP panel open animation
    useEffect(() => {
        if (isOpen && menuRef.current) {
            gsap.fromTo(menuRef.current,
                { opacity: 0, y: 50, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "expo.out" }
            );
        }
    }, [isOpen]);

    const completedCount = quests.filter(q => q.completed).length;

    return (
        <div className="fixed bottom-10 left-10 z-[500]">
            {/* Completion Notification */}
            {notif && (
                <div className="absolute bottom-24 left-0 w-80 p-5 rounded-2xl font-mono text-xs z-50 flex items-center gap-4
                    bg-gradient-to-r from-violet-600/90 to-purple-900/90 border border-violet-400/30
                    shadow-[0_0_40px_rgba(139,92,246,0.4)] backdrop-blur-xl">
                    <div className="size-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <TiLocationArrow className="text-yellow-400" size={20} />
                    </div>
                    <div>
                        <p className="text-yellow-400 font-bold uppercase tracking-widest text-[10px]">Quest Secured</p>
                        <p className="text-white font-bold">{notif.title}</p>
                        <p className="text-violet-300 text-[10px] mt-0.5">+{notif.xp} XP Awarded</p>
                    </div>
                </div>
            )}

            {/* Quest Panel */}
            {isOpen && (
                <div
                    ref={menuRef}
                    className="absolute bottom-24 left-0 w-[360px] bg-stone-900/70 border border-white/10 p-8 rounded-3xl
                        shadow-[0_30px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-zentry text-3xl uppercase text-white leading-none mb-1">Active Quests</h3>
                            <p className="text-[10px] uppercase font-bold text-violet-300 tracking-[0.2em]">Sync with Multiverse</p>
                        </div>
                        <div className="text-right">
                            <div className="size-12 rounded-full border border-white/10 flex items-center justify-center text-white/60 text-[10px] font-bold font-mono mb-1">
                                {completedCount}/{quests.length}
                            </div>
                        </div>
                    </div>

                    {/* XP Total */}
                    <div className="mb-6 p-4 rounded-2xl bg-stone-800/50 border border-white/5 flex items-center justify-between">
                        <span className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Total XP Earned</span>
                        <span className="font-zentry text-2xl text-yellow-400 uppercase">{totalXP} XP</span>
                    </div>

                    {/* Quest Items */}
                    <div className="space-y-4">
                        {quests.map(q => (
                            <div
                                key={q.id}
                                className={`group relative p-5 rounded-2xl transition-all duration-500 border overflow-hidden ${
                                    q.completed
                                        ? "bg-stone-800/20 border-green-500/20"
                                        : "bg-stone-900/40 border-white/5 hover:bg-stone-800/60"
                                }`}
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Status dot */}
                                        <div className={`size-2 rounded-full flex-shrink-0 ${q.completed ? "bg-green-400" : "bg-white/20"}`} />
                                        <div>
                                            <p className={`text-xs font-zentry uppercase tracking-widest ${q.completed ? "text-white/40" : "text-white"}`}>
                                                {q.title}
                                            </p>
                                            <p className="text-[10px] opacity-60 mt-0.5">{q.desc}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase flex-shrink-0 ml-2 ${q.completed ? "text-green-400" : "text-violet-300"}`}>
                                        {q.completed ? "✓ Done" : `+${q.xp} XP`}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 h-[2px] w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${
                                            q.completed ? "w-full bg-green-400/60" : "bg-violet-300/40 w-0 group-hover:w-1/3"
                                        }`}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors duration-500" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-[10px] opacity-50 text-center uppercase tracking-widest font-mono">
                            {completedCount === quests.length ? "All Quests Secured — Master Awaits" : "More quests unlocking at Level 5"}
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative size-20 flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl group-hover:bg-violet-500/40 transition-all duration-500" />
                <div className="absolute inset-0 border border-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />

                {/* XP Badge */}
                {totalXP > 0 && (
                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[9px] font-bold font-mono rounded-full px-1.5 py-0.5 z-20">
                        {totalXP}
                    </div>
                )}

                <div className="size-16 rounded-full bg-violet-300 text-black flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500 relative z-10">
                    <TiLocationArrow className={isOpen ? "rotate-180" : "rotate-0"} size={28} />
                </div>
            </button>
        </div>
    );
};

export default QuestSystem;
