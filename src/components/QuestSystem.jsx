import { useState, useEffect, useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";
import gsap from "gsap";

const QuestSystem = () => {
    const [quests, setQuests] = useState([
        { id: 1, title: "Explorer", desc: "Visit the Vault", completed: false, xp: 50 },
        { id: 2, title: "Stalker", desc: "View User Dashboard", completed: false, xp: 50 },
        { id: 3, title: "Reader", desc: "Check Latest News", completed: false, xp: 100 },
    ]);

    const [isOpen, setIsOpen] = useState(false);
    const [notif, setNotif] = useState(null);

    // Track page views to complete quests
    useEffect(() => {
        const path = window.location.pathname;
        let questId = null;
        if (path === "/vault") questId = 1;
        if (path === "/dashboard") questId = 2;
        if (path === "/news") questId = 3;

        if (questId) {
            setQuests(prev => prev.map(q => {
                if (q.id === questId && !q.completed) {
                    setNotif(`Quest Completed: ${q.title} (+${q.xp} XP)`);
                    setTimeout(() => setNotif(null), 3000);
                    return { ...q, completed: true };
                }
                return q;
            }));
        }
    }, [window.location.pathname]);

    const menuRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(menuRef.current, 
                { opacity: 0, y: 50, scale: 0.9, backdropFilter: "blur(0px)" },
                { opacity: 1, y: 0, scale: 1, backdropFilter: "blur(20px)", duration: 0.6, ease: "expo.out" }
            );
        }
    }, [isOpen]);

    return (
        <div className="fixed bottom-10 right-10 z-[500]">
            {/* Completion Notification */}
            {notif && (
                <div className="absolute bottom-24 right-0 w-72 bg-violet-300 text-black p-5 rounded-2xl shadow-[0_0_30px_rgba(167,139,250,0.5)] font-zentry uppercase text-xs z-50 flex items-center gap-3 border border-white/20">
                    <div className="size-8 rounded-xl bg-black flex items-center justify-center">
                        <TiLocationArrow className="text-violet-300" />
                    </div>
                    <span>{notif}</span>
                </div>
            )}
            
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="group relative size-20 flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl group-hover:bg-violet-500/40 transition-all duration-500" />
                <div className="absolute inset-0 border border-white/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
                <div className="size-16 rounded-full bg-violet-300 text-black flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500 relative z-10">
                    <TiLocationArrow className={isOpen ? "rotate-180" : "rotate-0"} size={28} />
                </div>
            </button>

            {/* Quest Menu */}
            {isOpen && (
                <div 
                    ref={menuRef}
                    className="absolute bottom-24 right-0 w-[350px] bg-stone-900/60 border-hsla p-8 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-zentry text-3xl uppercase text-white leading-none mb-1">Active Quests</h3>
                            <p className="text-[10px] uppercase font-bold text-violet-300 tracking-[0.2em]">Sync with Multiverse</p>
                        </div>
                        <div className="size-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 text-[10px] font-bold">
                            {quests.filter(q => q.completed).length}/{quests.length}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {quests.map(q => (
                            <div 
                                key={q.id} 
                                className={`group relative p-5 rounded-2xl transition-all duration-500 border border-white/5 overflow-hidden ${
                                    q.completed ? "bg-stone-800/20" : "bg-stone-900/40 hover:bg-stone-800/60"
                                }`}
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className={`text-xs font-zentry uppercase tracking-widest ${q.completed ? "text-white/40" : "text-white"}`}>
                                            {q.title}
                                        </p>
                                        <p className="text-[10px] opacity-70 mt-1">{q.desc}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold uppercase ${q.completed ? "text-green-400" : "text-violet-300"}`}>
                                            {q.completed ? "Secured" : `+${q.xp} XP`}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Indicator */}
                                <div className="mt-4 h-[2px] w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-out ${
                                            q.completed ? "bg-green-400/60 w-full" : "bg-violet-300/40 w-0 group-hover:w-1/4"
                                        }`} 
                                    />
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/5 transition-colors duration-500" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[10px] opacity-60 text-center uppercase tracking-widest">
                            More quests unlocking at Level 5
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestSystem;
