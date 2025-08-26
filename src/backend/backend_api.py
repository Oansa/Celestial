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
from datetime import datetime

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "test_images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/chat', methods=['POST'])
def chat():
    """Main chatbot endpoint supporting both text and voice input"""
    print(f"[DEBUG] Chat endpoint called at {datetime.now()}")
    try:
        data = request.json
        print(f"[DEBUG] Request data: {data}")
        
        message = data.get('message', '')
        image_data = data.get('image')
        use_voice = data.get('use_voice', False)
        
        print(f"[DEBUG] Message: '{message}', Use voice: {use_voice}, Has image: {bool(image_data)}")
        
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
            try:
                message = listen_to_user()
                response_data['transcription'] = message
                print(f"[DEBUG] Voice transcription: {message}")
            except Exception as e:
                print(f"[ERROR] Voice input failed: {str(e)}")
                response_data['transcription'] = f"Voice input failed: {str(e)}"
        
        # Process image if provided
        image_path = None
        if image_data:
            try:
                # Decode base64 image
                image_data = image_data.split(',')[1]  # Remove data:image/jpeg;base64,
                image_bytes = base64.b64decode(image_data)
                
                # Save to temporary file
                with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False, dir=UPLOAD_FOLDER) as tmp_file:
                    tmp_file.write(image_bytes)
                    image_path = tmp_file.name
                
                print(f"[DEBUG] Image saved to: {image_path}")
                
                # Detect objects
                detections = detect_objects(image_path)
                response_data['detections'] = detections
                print(f"[DEBUG] Object detections: {detections}")
                
                # Generate AI response
                ai_response = explain_scene(message, detections)
                response_data['ai_response'] = ai_response or "I'm sorry, I couldn't generate a response."
                print(f"[DEBUG] AI response: {ai_response}")
                
                # Generate audio response
                try:
                    speak_response(ai_response)
                    response_data['audio_response'] = "Audio response generated"
                    print("[DEBUG] Audio response generated successfully")
                except Exception as e:
                    response_data['audio_response'] = f"Audio generation failed: {str(e)}"
                    print(f"[ERROR] Audio generation failed: {str(e)}")
                    
            except Exception as e:
                print(f"[ERROR] Image processing failed: {str(e)}")
                response_data['ai_response'] = f"Image processing error: {str(e)}"
        else:
            # Handle text-only input
            print("[DEBUG] Processing text-only input")
            try:
                # For text-only input, we need to call explain_scene with empty detections
                ai_response = explain_scene(message, [])
                response_data['ai_response'] = ai_response or "I'm sorry, I couldn't generate a response."
                print(f"[DEBUG] Text-only AI response: {ai_response}")
            except Exception as e:
                print(f"[ERROR] Text processing failed: {str(e)}")
                response_data['ai_response'] = f"Text processing error: {str(e)}"
        
        print(f"[DEBUG] Final response data: {response_data}")
        return jsonify(response_data)
        
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"[ERROR] {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': error_msg}), 500

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

@app.route('/analyze', methods=['POST'])
def analyze():
    """Endpoint to analyze uploaded images"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False, dir=UPLOAD_FOLDER) as tmp_file:
            file.save(tmp_file.name)
            image_path = tmp_file.name
        
        # Detect objects in the image
        detections = detect_objects(image_path)
        
        # Clean up temporary file
        os.unlink(image_path)
        
        return jsonify({
            'success': True,
            'detections': detections,
            'message': 'Image analyzed successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/terminal', methods=['GET'])
def terminal():
    """Endpoint for the terminal interface"""
    return jsonify({'message': 'Terminal interface is ready.'})

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
