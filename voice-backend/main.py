import os
import json
import base64
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import websockets
from dotenv import load_dotenv

from rag_service import RagService

# Load env variables from parent directory
PARENT_ENV = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(PARENT_ENV)

app = FastAPI(title="Zentry AI Voice Agent Backend")

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_INSTRUCTION = """You are the Zentry Celestial Guide, an ancient yet futuristic artificial intelligence guiding players through the Zentry Gaming Multiverse. Your voice is echoing, immersive, and majestic. 
You speak in a cosmic, epic, yet helpful gaming tone. Keep your responses relatively short, conversational, and direct, as they will be spoken as voice output.
You have direct access to the Zentry Multiverse Lore and active player quests.
MANDATORY: If a user asks about quests, how to earn XP, level progress, leaderboard rankings, the Boundless Pillar, or general Zentry mechanics, you MUST call the `search_knowledge_base` tool to fetch accurate live data before answering. Do not make up any information.
"""

@app.get("/")
def read_root():
    return {"status": "active", "message": "Zentry AI Voice Server Running"}

@app.websocket("/stream-voice")
async def stream_voice(websocket: WebSocket):
    await websocket.accept()
    print("[Server] Client connected to WebSocket")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[Server] Error: GEMINI_API_KEY not found in environment!")
        await websocket.send_json({"type": "error", "message": "GEMINI_API_KEY is missing on the server. Please add it to your .env file."})
        await websocket.close()
        return

    # Establish Gemini Live API URL
    gemini_live_url = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key={api_key}"

    try:
        async with websockets.connect(gemini_live_url) as gemini_ws:
            print("[Server] Connected to Gemini Multimodal Live API")

            # 1. Send Setup Configuration
            voice_name = websocket.query_params.get("voice", "Aoede")
            if voice_name not in ["Puck", "Charon", "Kore", "Fenrir", "Aoede"]:
                voice_name = "Aoede"

            setup_message = {
                "setup": {
                    "model": "models/gemini-2.5-flash-native-audio-latest",
                    "generationConfig": {
                        "responseModalities": ["AUDIO"],
                        "thinkingConfig": {
                            "thinkingBudget": 0
                        },
                        "speechConfig": {
                            "voiceConfig": {
                                "prebuiltVoiceConfig": {
                                    "voiceName": voice_name
                                }
                            }
                        }
                    },
                    "systemInstruction": {
                        "parts": [
                            {"text": SYSTEM_INSTRUCTION}
                        ]
                    },
                    "tools": [
                        {
                            "functionDeclarations": [
                                {
                                    "name": "search_knowledge_base",
                                    "description": "Query the Zentry Gaming Multiverse knowledge base for information about quests, lore, player stats, leaderboard, or mechanics.",
                                    "parameters": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "query": {
                                                "type": "STRING",
                                                "description": "Keywords to search the lore, e.g. 'active quests', 'master progress', 'NeonX', 'what is Zentry'."
                                            }
                                        },
                                        "required": ["query"]
                                    }
                                },
                                {
                                    "name": "navigate_to_page",
                                    "description": "Navigate the user's browser viewport to a specific section or page on the Zentry Gaming Multiverse website. Use this tool whenever the user asks you to: show, open, take them to, or navigate to a page like the Vault, News, Dashboard, About, or Contact page.",
                                    "parameters": {
                                        "type": "OBJECT",
                                        "properties": {
                                            "page": {
                                                "type": "STRING",
                                                "description": "The destination URL path. Valid paths are: '/' (Home page), '/vault' (The Vault, where lootboxes and games are), '/dashboard' (Dashboard, user stats/profile), '/news' (News/latest articles), '/contact-us' (Contact page)."
                                            }
                                        },
                                        "required": ["page"]
                                    }
                                }
                            ]
                        }
                    ]
                }
            }

            await gemini_ws.send(json.dumps(setup_message))

            # Handlers for bidirectional forwarding
            async def receive_from_client():
                try:
                    while True:
                        # Receive from frontend client
                        data = await websocket.receive()
                        
                        if "bytes" in data:
                            # Forward raw PCM binary chunk to Gemini (in base64)
                            base64_audio = base64.b64encode(data["bytes"]).decode("utf-8")
                            client_msg = {
                                "realtimeInput": {
                                    "mediaChunks": [
                                        {
                                            "mimeType": "audio/pcm;rate=16000",
                                            "data": base64_audio
                                        }
                                    ]
                                }
                            }
                            await gemini_ws.send(json.dumps(client_msg))

                        elif "text" in data:
                            msg = json.loads(data["text"])
                            msg_type = msg.get("type")

                            if msg_type == "start-recording":
                                print("[Server] User started recording")
                                # No special message to Gemini needed, it will receive media chunks next

                            elif msg_type in ["stop-recording", "request-response"]:
                                print("[Server] User stopped recording, requesting response")
                                stop_msg = {
                                    "clientContent": {
                                        "turns": [],
                                        "turnComplete": True
                                    }
                                }
                                await gemini_ws.send(json.dumps(stop_msg))

                            elif msg_type == "stop-generation":
                                print("[Server] User interrupted bot playback")
                                stop_msg = {
                                    "clientContent": {
                                        "turns": [],
                                        "turnComplete": True
                                    }
                                }
                                await gemini_ws.send(json.dumps(stop_msg))

                            elif msg_type == "text-turn":
                                text = msg.get("text", "")
                                print(f"[Server] User sent text turn: '{text}'")
                                text_msg = {
                                    "clientContent": {
                                        "turns": [
                                            {
                                                "role": "user",
                                                "parts": [{"text": text}]
                                            }
                                        ],
                                        "turnComplete": True
                                    }
                                }
                                await gemini_ws.send(json.dumps(text_msg))

                except WebSocketDisconnect:
                    print("[Server] Client disconnected")
                except Exception as e:
                    print(f"[Server] Error in receive_from_client: {e}")

            async def send_to_client():
                try:
                    while True:
                        # Receive from Gemini WebSocket
                        resp = await gemini_ws.recv()
                        resp_data = json.loads(resp)

                        # Setup complete notification
                        if "setupComplete" in resp_data:
                            print("[Server] Gemini Live Session Setup Complete")
                            await websocket.send_json({"type": "ready"})

                        # Tool calling handling
                        elif "toolCall" in resp_data:
                            calls = resp_data["toolCall"].get("functionCalls", [])
                            for call in calls:
                                if call.get("name") == "search_knowledge_base":
                                    query = call.get("args", {}).get("query", "")
                                    print(f"[Server] Gemini tool call 'search_knowledge_base' query: '{query}'")
                                    
                                    # Perform local search
                                    lore_context = RagService.retrieve(query)
                                    
                                    # Send result back to Gemini Live
                                    tool_resp = {
                                        "toolResponse": {
                                            "functionResponses": [
                                                {
                                                    "name": "search_knowledge_base",
                                                    "id": call.get("id"),
                                                    "response": {"output": lore_context}
                                                }
                                            ]
                                        }
                                    }
                                    await gemini_ws.send(json.dumps(tool_resp))
                                
                                elif call.get("name") == "navigate_to_page":
                                    page = call.get("args", {}).get("page", "/")
                                    print(f"[Server] Gemini tool call 'navigate_to_page' path: '{page}'")
                                    
                                    # Tell frontend to navigate
                                    await websocket.send_json({"type": "navigate", "path": page})
                                    
                                    # Send success back to Gemini
                                    tool_resp = {
                                        "toolResponse": {
                                            "functionResponses": [
                                                {
                                                    "name": "navigate_to_page",
                                                    "id": call.get("id"),
                                                    "response": {"status": "success", "message": f"Successfully navigated user to {page}"}
                                                }
                                            ]
                                        }
                                    }
                                    await gemini_ws.send(json.dumps(tool_resp))

                        # Content streaming (Audio / Text)
                        elif "serverContent" in resp_data:
                            sc = resp_data["serverContent"]
                            
                            # Check interruption
                            if sc.get("interrupted"):
                                print("[Server] Gemini interrupted")
                                await websocket.send_json({"type": "interrupted"})
                                continue

                            model_turn = sc.get("modelTurn")
                            if model_turn:
                                for part in model_turn.get("parts", []):
                                    # Transcript part
                                    if "text" in part:
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "text": part["text"]
                                        })

                                    # Audio part
                                    if "inlineData" in part:
                                        mime = part["inlineData"].get("mimeType", "")
                                        if mime.startswith("audio/pcm"):
                                            audio_b64 = part["inlineData"].get("data", "")
                                            await websocket.send_json({
                                                "type": "audio",
                                                "data": audio_b64
                                            })

                            # Check turn completion
                            if sc.get("turnComplete"):
                                await websocket.send_json({"type": "done"})

                except websockets.exceptions.ConnectionClosed:
                    print("[Server] Gemini WebSocket closed")
                except Exception as e:
                    print(f"[Server] Error in send_to_client: {e}")

            # Run loops concurrently; when one finishes/fails, cancel the other
            client_task = asyncio.create_task(receive_from_client())
            gemini_task = asyncio.create_task(send_to_client())

            try:
                done, pending = await asyncio.wait(
                    [client_task, gemini_task],
                    return_when=asyncio.FIRST_COMPLETED
                )
                for task in pending:
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
            except Exception as e:
                print(f"[Server] Task error: {e}")
                client_task.cancel()
                gemini_task.cancel()

    except websockets.exceptions.InvalidStatusCode as e:
        print(f"[Server] Gemini API rejected connection (invalid API key or model?): {e}")
        try:
            await websocket.send_json({"type": "error", "message": f"Gemini API rejected the connection. Check your API key and model name. ({e})"})
            await websocket.close()
        except:
            pass
    except Exception as e:
        print(f"[Server] Error connecting to Gemini API: {e}")
        try:
            await websocket.send_json({"type": "error", "message": f"Gemini connection error: {str(e)}"})
            await websocket.close()
        except:
            pass
