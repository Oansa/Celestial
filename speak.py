# speak_response.py
import pyttsx3

def speak_response(text):
    print(f"[🗣️] Speaking: {text}")
    engine = pyttsx3.init()
    engine.setProperty('rate', 160)
    engine.setProperty('volume', 1.0)
    engine.say(text)
    engine.runAndWait()




# import pyttsx3
# import speech_recognition as sr

# # Initialize text-to-speech engine
# engine = pyttsx3.init()
# engine.setProperty('rate', 160)

# def speak(text):
#     engine.say(text)
#     engine.runAndWait()

# def listen():
#     recognizer = sr.Recognizer()
#     with sr.Microphone() as source:
#         print("Listening...")
#         audio = recognizer.listen(source)
#     try:
#         query = recognizer.recognize_google(audio)
#         return query
#     except sr.UnknownValueError:
#         return "Sorry, I didn't catch that."

