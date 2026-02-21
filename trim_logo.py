from PIL import Image, ImageChops
import sys

def trim(image_path, output_path):
    try:
        im = Image.open(image_path)
    except Exception as e:
        print(f"Error opening image: {e}")
        return

    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        im = im.crop(bbox)
        im.save(output_path)
        print(f"Trimmed image saved to {output_path}")
    else:
        print("No bounding box found, image might be empty or solid color.")

if __name__ == "__main__":
    trim('/Users/haneesh/yolowebsite26/assets/icons/header_logo.png', '/Users/haneesh/yolowebsite26/assets/icons/header_logo_trimmed.png')
