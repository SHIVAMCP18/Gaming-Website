# Zentry Gaming Multiverse

A high-performance gaming platform built around the idea of a unified play economy. It combines premium animations, glassmorphic UI, and an AI-powered voice assistant into one immersive experience.

Live demo: [zentry-gaming.netlify.app](https://zentry-gaming.netlify.app) (if deployed)

---

## What this project does

Zentry is a concept for a shared gaming multiverse — think of it as an MMORPG layer that sits on top of all the games you already play. The website serves as the portal into that world, complete with:

- **AI Voice Agent** — A real-time voice assistant powered by Google's Gemini Live API. You can talk to it, ask about quests, navigate the site by voice, or just explore the lore. It uses a Python backend with a simple RAG (retrieval-augmented generation) system to pull answers from a local knowledge base.

- **Authentication** — Full sign-up and sign-in flow backed by Supabase, with email/password auth and session management.

- **Quest System** — Interactive quest cards that track your progress across the site. Visit pages, complete objectives, and earn XP. Progress persists through Supabase.

- **The Vault** — A collection hub for games, lootboxes, and interactive cards with hover animations and category filtering.

- **Dashboard** — Player stats, level progression, leaderboard rankings, and account management.

- **Celestial Visuals** — Layered video backgrounds, parallax star fields, and smooth scroll-triggered animations throughout.

- **Multiverse Map** — An interactive layout showing the different layers and realms of the game economy.

---

## Tech Stack

**Frontend**
- React 19 with Vite
- Tailwind CSS
- GSAP for animations
- React Router DOM
- React Icons
- Supabase JS client

**Voice Agent Backend**
- Python with FastAPI
- WebSocket proxy to Gemini Live API (BidiGenerateContent)
- Local RAG service using keyword matching against a JSON knowledge base
- Uvicorn server

---

## Getting Started

### Prerequisites
- Node.js (LTS version)
- Python 3.10+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- A Supabase project (free tier works fine)

### 1. Clone and install

```bash
git clone https://github.com/SHIVAMCP18/Gaming-Website.git
cd Gaming-Website
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

Your `.env` should look like this:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Start the frontend

```bash
npm run dev
```

Opens at `http://localhost:5173` by default.

### 4. Start the voice backend (optional, for AI agent)

In a separate terminal:

```bash
cd voice-backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The voice agent widget in the bottom-right corner of the site will connect to this backend automatically.

---

## Deployment

### Frontend (Netlify)

1. Connect the GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in Netlify

### Voice Backend

The Python backend needs to run on a server that supports WebSockets. You can deploy it to Railway, Render, or any VPS. Make sure to set the `GEMINI_API_KEY` environment variable on the server.

If you deploy the backend somewhere other than localhost, update the WebSocket URL in `src/components/VoiceAgent.jsx` (line 181) to point to your deployed backend.

---

## Project Structure

```
Gaming-Website/
  src/
    components/       -- React components (VoiceAgent, Auth, Dashboard, Vault, etc.)
    lib/              -- Supabase client setup
  voice-backend/
    main.py           -- FastAPI WebSocket server, Gemini Live API proxy
    rag_service.py    -- Local knowledge base search
    zentry_lore.json  -- Game lore and quest data
  public/             -- Static assets, videos, fonts
```

---

## Design Approach

The UI follows a dark-first design with high contrast and purple/gold accents. Typography uses Robert-Regular, Zentry-Font, and Circular-Web custom fonts. Every interactive element has hover states and micro-animations to keep the experience feeling alive.

The glassmorphism style (frosted glass panels with subtle borders) is used throughout for cards, modals, and overlays.

---

## Contributing

If you want to contribute:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a pull request

---

## License

MIT License. See `LICENSE` for details.

---

Built by [Shivam Patel](https://github.com/SHIVAMCP18)
