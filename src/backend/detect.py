# # detect_objects.py
# from PIL import Image
# import torchvision.transforms as transforms
# import torch
# import torchvision.models as models
# import os

# # image_path = C:\Users\user\PROGRAMMES\PYTHON\Space Explorer\test_images\mars.JPG

# def detect_objects(image_path):
#     print("[📸] Simulating Mars camera snapshot...")
#     image_path = "test_images/mars.jpg"  # replace with actual Mars cam in future

#     if not os.path.exists(image_path):
#         raise FileNotFoundError("Image file not found. Provide a 'mars.jpg' in your directory.")

#     image = Image.open(image_path).convert("RGB")
#     transform = transforms.Compose([
#         transforms.Resize((224, 224)),
#         transforms.ToTensor(),
#     ])
#     img_tensor = transform(image).unsqueeze(0)

#     model = models.resnet18(pretrained=True)
#     model.eval()
#     with torch.no_grad():
#         outputs = model(img_tensor)
#     _, predicted = outputs.max(1)

#     labels_path = "imagenet_classes.txt"
#     if not os.path.exists(labels_path):
#         import urllib.request
#         urllib.request.urlretrieve(
#             "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt",
#             labels_path
#         )

#     with open(labels_path) as f:
#         labels = [line.strip() for line in f.readlines()]

#     label = labels[predicted.item()]
#     print(f"[🔍] Detected: {label}")
#     return label


# detect.py

# import cv2
# import os

# def detect_objects(image_path="test_images/sample_mars_image.jpg"):
#     if not os.path.exists(image_path):
#         raise FileNotFoundError(f"Image file not found: {image_path}")

#     print(f"[👁️] Detecting objects in: {image_path}")
    
#     # Dummy detection
#     return ["metallic rover part", "dusty rock", "alien footprint"]


# vision/detect.py

# from ultralytics import YOLO
# import cv2
# import os

# # Load pre-trained YOLOv8 model
# model = YOLO("yolov8n.pt")  # 'n' = nano, fast & light

# def detect_objects(image_path):
#     if not os.path.exists(image_path):
#         raise FileNotFoundError("Image file not found. Provide a valid image.")

#     # Load image
#     img = cv2.imread(image_path)

#     # Run detection
#     results = model(img)[0]
#     detections = []

#     for result in results.boxes.data.tolist():
#         x1, y1, x2, y2, score, class_id = result
#         class_name = model.names[int(class_id)]
#         detections.append(class_name)

#         # Optional: Draw bounding boxes
#         cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (0,255,0), 2)
#         cv2.putText(img, f"{class_name} {score:.2f}", (int(x1), int(y1) - 10), 
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)

#     # Save or show result
#     cv2.imwrite("test_images/marked_detections.jpg", img)

#     return list(set(detections))  # Return unique object names


########Detect.py
from ultralytics import YOLO
import cv2

# Load a pretrained YOLOv8n model (or 'yolov8s', 'yolov8m', etc.)
model = YOLO("yolov8n.pt")

def detect_objects(image_path):
    results = model(image_path)
    labels = []

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls)
            label = model.names[cls_id]
            labels.append(label)

    return list(set(labels))  # Return unique object labels


# from ultralytics import YOLO
# import cv2

# # Load your trained model
# model = YOLO("yolov8n.pt")  # Replace with your model

# def detect_objects():
#     # Open webcam (0 for default camera)
#     cap = cv2.VideoCapture(0)

#     while cap.isOpened():
#         ret, frame = cap.read()
#         if not ret:
#             break

#         # Run YOLOv8 inference on the frame
#         results = model(frame)

#         # Visualize the results
#         annotated_frame = results[0].plot()

#         # Display
#         cv2.imshow("Celestial Live Detection", annotated_frame)

#         # Press Q to quit
#         if cv2.waitKey(1) & 0xFF == ord("q"):
#             break

#     cap.release()
#     cv2.destroyAllWindows()
