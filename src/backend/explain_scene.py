# explain_scene.py
# explain_scene.py
import openai

openai.api_key = "YOUR_OPENAI_API_KEY"  # Replace this with your actual key

def explain_scene(user_input, object_detected):
    prompt = f"""
    You are a helpful AI assistant guiding an astronaut on Mars.
    The astronaut said: "{user_input}"
    The system detected: "{object_detected}"
    
    Based on this, respond with insightful advice or an explanation:
    Don't include emojis or any special characters in the output.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",  # or "gpt-3.5-turbo"
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        message = response.choices[0].message.content.strip()
        print(f"[🤖] AI Response: {message}")
        return message
    except Exception as e:
        print(f"[❌] Error calling OpenAI: {e}")
        return "I'm experiencing difficulty processing your request."






