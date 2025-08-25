# listen.py
import speech_recognition as sr

def listen_to_user():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    with mic as source:
        print("[🎤] Listening for user command...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        command = recognizer.recognize_google(audio)
        print(f"[✅] Heard: {command}")
        return command
    except sr.UnknownValueError:
        print("[❌] Could not understand audio.")
        return "I didn't catch that."
    except sr.RequestError as e:
        print(f"[❌] Speech service error: {e}")
        return "Speech service is down."


