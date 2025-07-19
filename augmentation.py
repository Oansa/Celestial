import os
import cv2
import albumentations as A

def augment_images(input_path, output_path, augmentations_per_image=5):
    # Create output directory if it doesn't exist
    os.makedirs(output_path, exist_ok=True)

    # Define augmentation pipeline
    transform = A.Compose([
        A.HorizontalFlip(p=0.5),
        A.RandomBrightnessContrast(p=0.5),
        A.Rotate(limit=15, p=0.5),
        A.MotionBlur(p=0.2),
        A.RandomShadow(p=0.3),
    ])

    # Supported image types
    valid_extensions = ('.jpg', '.jpeg', '.png')

    total_augmented = 0

    for img_name in os.listdir(input_path):
        if not img_name.lower().endswith(valid_extensions):
            continue

        image_path = os.path.join(input_path, img_name)
        image = cv2.imread(image_path)

        if image is None:
            print(f"❌ Could not read {img_name}. Skipping.")
            continue

        base_name = os.path.splitext(img_name)[0]

        for i in range(augmentations_per_image):
            augmented = transform(image=image)["image"]
            new_filename = f"{base_name}_aug_{i+1}.jpg"
            cv2.imwrite(os.path.join(output_path, new_filename), augmented)
            total_augmented += 1

    print(f"\n✅ Done! {total_augmented} augmented images saved to '{output_path}'")

if __name__ == "__main__":
    print("By 5 Image Augmentor")
    input_folder = input("📂 Enter path to your original images folder: ").strip()
    output_folder = input("💾 Enter destination path for augmented images: ").strip()
    augment_images(input_folder, output_folder)
