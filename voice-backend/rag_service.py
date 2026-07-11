import json
import os

LORE_FILE_PATH = os.path.join(os.path.dirname(__file__), "zentry_lore.json")

class RagService:
    @staticmethod
    def load_lore():
        try:
            if os.path.exists(LORE_FILE_PATH):
                with open(LORE_FILE_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print("Failed to load lore JSON:", e)
        return {}

    @staticmethod
    def retrieve(query: str) -> str:
        if not query:
            return "No query provided."

        lore = RagService.load_lore()
        if not lore:
            return "Lore database is empty or could not be loaded."

        query_lower = query.lower()
        results = []

        # Check multiverse general info
        if "multiverse" in query_lower or "zentry" in query_lower or "economy" in query_lower or "what is" in query_lower:
            mv = lore.get("multiverse", {})
            results.append(f"Zentry Multiverse: {mv.get('description', '')} (Motto: '{mv.get('motto', '')}')")

        # Check pillar info
        if "pillar" in query_lower or "boundless" in query_lower or "center" in query_lower:
            pl = lore.get("the_pillar", {})
            results.append(f"The Boundless Pillar: {pl.get('description', '')}")

        # Check quests info
        if "quest" in query_lower or "task" in query_lower or "challenge" in query_lower or "xp" in query_lower:
            quests = lore.get("quests", [])
            quest_list = []
            for q in quests:
                quest_list.append(f"- Quest {q.get('id')}: '{q.get('title')}' -> Goal: {q.get('requirement')}, Reward: {q.get('reward')}. Tip: {q.get('tips')}")
            results.append("Active Quests:\n" + "\n".join(quest_list))

        # Check features
        if "feature" in query_lower or "visual" in query_lower or "gsap" in query_lower or "animation" in query_lower or "map" in query_lower:
            features = lore.get("features", [])
            feature_list = []
            for f in features:
                feature_list.append(f"- {f.get('name')}: {f.get('description')}")
            results.append("Gaming Platform Features:\n" + "\n".join(feature_list))

        # Check levels / tiers / leaderboard
        if "level" in query_lower or "tier" in query_lower or "rank" in query_lower or "leaderboard" in query_lower or "progress" in query_lower or "neonx" in query_lower or "xp" in query_lower:
            lt = lore.get("levels_and_tiers", {})
            results.append(f"Level/Progress: {lt.get('current_level_progress', '')}")
            lb = lt.get("leaderboard", [])
            lb_list = []
            for p in lb:
                lb_list.append(f"Rank #{p.get('rank')} {p.get('name')} ({p.get('xp')}, Tier: {p.get('tier')})")
            results.append("Leaderboard Standings:\n" + "\n".join(lb_list))

        if not results:
            # Fallback to returning general overview if no specific matches
            mv = lore.get("multiverse", {})
            return f"Zentry Overview: {mv.get('description', '')} Please ask specifically about Quests, features, the Boundless Pillar, or the Leaderboard/Ranks."

        return "\n\n".join(results)
