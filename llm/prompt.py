# llm/prompt.py
import json
import requests

# Load config
with open("config.json") as f:
    config = json.load(f)

OLLAMA_URL = "http://localhost:11434/api/generate"

def explain_scene(user_text, detections):
    prompt = (
        f"{config['system_role']}\n\n"
        f"The user said: '{user_text}'\n"
        f"Objects detected on Mars: {', '.join(detections)}\n"
        f"Provide a helpful and insightful explanation."
    )

    payload = {
        "model": config["llm_model"],
        "prompt": prompt,
        "temperature": config["temperature"],
        "max_tokens": config["max_tokens"],
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        return response.json().get("response", "").strip()
    except requests.exceptions.RequestException as e:
        return f"[Error querying LLaMA2 via Ollama]: {e}"
