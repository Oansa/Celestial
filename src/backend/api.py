from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import os
from listen import listen_to_user
from detect import detect_objects
from llm.prompt import explain_scene
from speak import speak_response

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "test_images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/analyze', methods=['POST'])
def analyze():
    mode = request.form.get('mode')
    use_voice = request.form.get('use_voice') == 'true'
    output_lines = []

    if mode == 'live':
        output_lines.append("[INFO] Mars AI Assistant initialized.")
        if use_voice:
            user_text = listen_to_user()
            output_lines.append(f"[INFO] Heard: {user_text}")
        else:
            user_text = request.form.get('user_text')
            output_lines.append(f"[INFO] Text input: {user_text}")

        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        if not ret:
            output_lines.append("[INFO] Failed to capture image.")
            return jsonify({'output': "\n".join(output_lines)})
        img_path = os.path.join(UPLOAD_FOLDER, "mars.jpg")
        cv2.imwrite(img_path, frame)
    else:
        file = request.files['image']
        img_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(img_path)
        if use_voice:
            user_text = listen_to_user()
            output_lines.append(f"[INFO] Heard: {user_text}")
        else:
            user_text = request.form.get('user_text')
            output_lines.append(f"[INFO] Text input: {user_text}")

    detections = detect_objects(img_path)
    output_lines.append(f"[INFO] Objects Detected: {detections}")

    response = explain_scene(user_text, detections)
    output_lines.append(f"[INFO] Response: {response}")

    # Ensure speech happens for both modes
    try:
        speak_response(response)
        output_lines.append("[INFO] Speech output completed")
    except Exception as e:
        output_lines.append(f"[ERROR] Speech output failed: {str(e)}")

    return jsonify({'output': "\n".join(output_lines)})

if __name__ == "__main__":
    app.run(debug=True)