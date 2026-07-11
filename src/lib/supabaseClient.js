import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// ── Profile Helpers ─────────────────────────────────────────────────────────

/** Fetch profile for a given user id */
export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    if (error) console.error("[Supabase] getProfile error:", error.message);
    return data;
};

/** Award XP to the current user */
export const addXP = async (userId, xp) => {
    const { data: profile } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", userId)
        .single();
    if (!profile) return;

    const newXP = (profile.xp || 0) + xp;
    const { error } = await supabase
        .from("profiles")
        .update({ xp: newXP, updated_at: new Date().toISOString() })
        .eq("id", userId);
    if (error) console.error("[Supabase] addXP error:", error.message);
    return newXP;
};

/** Mark a quest as completed for the user */
export const completeQuest = async (userId, questId) => {
    const { data: profile } = await supabase
        .from("profiles")
        .select("completed_quests")
        .eq("id", userId)
        .single();
    if (!profile) return;

    const current = profile.completed_quests || [];
    if (current.includes(questId)) return; // already done

    const updated = [...current, questId];
    await supabase
        .from("profiles")
        .update({ completed_quests: updated, updated_at: new Date().toISOString() })
        .eq("id", userId);
};

/** Add an item to the player's inventory */
export const addToInventory = async (userId, item) => {
    const { data: profile } = await supabase
        .from("profiles")
        .select("inventory")
        .eq("id", userId)
        .single();
    if (!profile) return;

    const current = profile.inventory || [];
    const updated = [...current, { ...item, acquiredAt: new Date().toISOString() }];
    await supabase
        .from("profiles")
        .update({ inventory: updated, updated_at: new Date().toISOString() })
        .eq("id", userId);
    return updated;
};

/** Fetch all profiles sorted by XP for leaderboard */
export const getLeaderboard = async () => {
    const { data, error } = await supabase
        .from("profiles")
        .select("username, xp")
        .order("xp", { ascending: false })
        .limit(10);
    if (error) console.error("[Supabase] getLeaderboard error:", error.message);
    return data || [];
};

/** Compute tier from XP */
export const getTier = (xp) => {
    if (xp >= 100000) return "Grandmaster";
    if (xp >= 50000) return "Master";
    if (xp >= 20000) return "Elite";
    if (xp >= 5000) return "Veteran";
    return "Recruit";
};

/** Compute progress % to next tier */
export const getTierProgress = (xp) => {
    const tiers = [0, 5000, 20000, 50000, 100000, 200000];
    for (let i = 0; i < tiers.length - 1; i++) {
        if (xp < tiers[i + 1]) {
            const range = tiers[i + 1] - tiers[i];
            const progress = xp - tiers[i];
            return {
                percent: Math.round((progress / range) * 100),
                current: tiers[i],
                next: tiers[i + 1],
                remaining: tiers[i + 1] - xp,
            };
        }
    }
    return { percent: 100, current: 200000, next: 200000, remaining: 0 };
};
