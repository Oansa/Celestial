# detect_objects.py
from PIL import Image
import torchvision.transforms as transforms
import torch
import torchvision.models as models
import os

# image_path = C:\Users\user\PROGRAMMES\PYTHON\Space Explorer\test_images\mars.JPG

def detect_objects(image_path):
    print("[📸] Simulating Mars camera snapshot...")
    image_path = "test_images/mars.jpg"  # replace with actual Mars cam in future

    if not os.path.exists(image_path):
        raise FileNotFoundError("Image file not found. Provide a 'mars.jpg' in your directory.")

    image = Image.open(image_path).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    img_tensor = transform(image).unsqueeze(0)

    model = models.resnet18(pretrained=True)
    model.eval()
    with torch.no_grad():
        outputs = model(img_tensor)
    _, predicted = outputs.max(1)

    labels_path = "imagenet_classes.txt"
    if not os.path.exists(labels_path):
        import urllib.request
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt",
            labels_path
        )

    with open(labels_path) as f:
        labels = [line.strip() for line in f.readlines()]

    label = labels[predicted.item()]
    print(f"[🔍] Detected: {label}")
    return label
