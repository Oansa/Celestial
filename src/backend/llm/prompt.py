# llm/prompt.py
import json
import requests

# Load config
import os
config_path = os.path.join(os.path.dirname(__file__), '..', 'config.json')
with open(config_path) as f:
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

    print(f"[DEBUG] Constructed prompt: {prompt}")  # Log the constructed prompt
    try:
        response = requests.post(OLLAMA_URL, json=payload)
        print(f"[DEBUG] API response status code: {response.status_code}")  # Log the response status code
        response.raise_for_status()
        ai_response = response.json().get("response", "").strip()
        print(f"[DEBUG] AI response: {ai_response}")  # Log the AI response
        return ai_response
    except requests.exceptions.RequestException as e:
        error_msg = f"[Error querying LLaMA2 via Ollama]: {e}"
        print(f"[DEBUG] Error: {error_msg}")  # Log the error
        return error_msg
