from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import os
import base64
import io
from PIL import Image
import numpy as np
from listen import listen_to_user
from detect import detect_objects
from llm.prompt import explain_scene
from speak import speak_response
import tempfile

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "test_images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/chat', methods=['POST'])
def chat():
    """Main chatbot endpoint supporting both text and voice input"""
    try:
        data = request.json
        message = data.get('message', '')
        image_data = data.get('image')
        use_voice = data.get('use_voice', False)
        
        response_data = {
            'user_message': message,
            'transcription': '',
            'detections': [],
            'ai_response': '',
            'audio_response': None
        }
        
        # Handle voice input if requested
        if use_voice and not message:
            print("[INFO] Listening for voice input...")
            message = listen_to_user()
            response_data['transcription'] = message
        
        # Process image if provided
        image_path = None
        if image_data:
            # Decode base64 image
            image_data = image_data.split(',')[1]  # Remove data:image/jpeg;base64,
            image_bytes = base64.b64decode(image_data)
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False, dir=UPLOAD_FOLDER) as tmp_file:
                tmp_file.write(image_bytes)
                image_path = tmp_file.name
            
            # Detect objects
            detections = detect_objects(image_path)
            response_data['detections'] = detections
            
            # Generate AI response
            ai_response = explain_scene(message, detections)
            response_data['ai_response'] = ai_response
            
            # Generate audio response
            try:
                speak_response(ai_response)
                response_data['audio_response'] = "Audio response generated"
            except Exception as e:
                response_data['audio_response'] = f"Audio generation failed: {str(e)}"
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/voice-input', methods=['POST'])
def voice_input():
    """Endpoint specifically for voice input"""
    try:
        print("[INFO] Processing voice input...")
        user_text = listen_to_user()
        return jsonify({'transcription': user_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

@app.route('/run-main', methods=['POST'])
def run_main():
    """Endpoint to run main.py script"""
    try:
        import subprocess
        import sys
        
        # Run main.py using the current Python interpreter
        result = subprocess.run(
            [sys.executable, 'main.py'],
            capture_output=True,
            text=True,
            timeout=150,  # Increase timeout to 150 seconds
            encoding='utf-8'  # Specify encoding
        )
        
        print("STDOUT:", result.stdout)  # Log the standard output
        print("STDERR:", result.stderr)  # Log the standard error
        
        return jsonify({
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'return_code': result.returncode
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'error': 'Script execution timed out'
        }), 408
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
