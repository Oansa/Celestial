# main.py
from listen import listen_to_user
from detect import detect_objects
from llm.prompt import explain_scene
from speak import speak_response
import cv2

def main():
    print("[🚀] Mars AI Assistant initialized.")
    
    # Step 1: Listen to user's voice command
    user_text = listen_to_user()
    print(f"[🗣️] Heard: {user_text}")

    # Step 2: Capture image from webcam (simulate Mars cam)
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    if not ret:
        print("[❌] Failed to capture image.")
        return
    cv2.imwrite("test_images/mars.jpg", frame)

    # Step 3: Detect objects
    detections = detect_objects("test_images/mars.jpg")
    print(f"[👁️] Objects Detected: {detections}")

    # Step 4: Explain objects
    response = explain_scene(user_text, detections)
    print(f"[🤖] Response: {response}")

    # Step 5: Speak response
    speak_response(response)

if __name__ == "__main__":
    main()
