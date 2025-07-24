# speak_response.py
import pyttsx3

def speak_response(text):
    print(f"[🗣️] Speaking: {text}")
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)
    engine.setProperty('volume', 1.0)
    engine.say(text)
    engine.runAndWait()


