#!/usr/bin/env python3
"""
YOLO Living - Image Optimizer
Converts JPG/PNG images to WebP format and updates HTML references.
Preserves original files alongside the new WebP versions.
"""

import os
import re
import glob
from PIL import Image

# Configuration
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(PROJECT_ROOT, 'assets')
WEBP_QUALITY = 80
MAX_WIDTH = 1920  # Max width for content images
ICON_MAX_WIDTH = 512  # Max width for icons (smaller)

# File extensions to convert
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
# Extensions to skip (keep as-is because they're small logos/icons that need transparency)
SKIP_FILES = {'favicon.png'}


def convert_image(input_path, output_path, max_width):
    """Convert a single image to WebP format with resizing."""
    try:
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if needed (for JPG sources)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Keep alpha for PNG files
                if input_path.lower().endswith('.png'):
                    pass  # Keep RGBA
                else:
                    img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Resize if wider than max_width
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.LANCZOS)

            # Save as WebP
            img.save(output_path, 'WEBP', quality=WEBP_QUALITY, method=6)

            # Report size reduction
            original_size = os.path.getsize(input_path)
            new_size = os.path.getsize(output_path)
            reduction = (1 - new_size / original_size) * 100
            print(f"  ✓ {os.path.basename(input_path)}: "
                  f"{original_size / 1024:.0f}KB → {new_size / 1024:.0f}KB "
                  f"({reduction:.0f}% smaller)")
            return True
    except Exception as e:
        print(f"  ✗ Error converting {input_path}: {e}")
        return False


def find_images(directory):
    """Find all convertible images in the assets directory."""
    images = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            name, ext = os.path.splitext(file)
            if ext.lower() in IMAGE_EXTENSIONS and file not in SKIP_FILES:
                images.append(os.path.join(root, file))
    return images


def update_html_references(project_root):
    """Update all HTML files to reference .webp images instead of original formats."""
    html_files = glob.glob(os.path.join(project_root, '*.html'))
    # Pattern to match image references in src, poster attributes
    # Matches: assets/images/IMG_3229.JPG or assets/icons/header_logo.png etc.
    pattern = re.compile(
        r'(assets/(?:images|icons)/[^"\'>\s]+?)\.(jpg|jpeg|png|JPG|JPEG|PNG)',
        re.IGNORECASE
    )

    updated_count = 0
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        def replace_ref(match):
            full_path = match.group(1)
            ext = match.group(2)
            basename = os.path.basename(full_path) + '.' + ext
            # Skip favicon
            if basename in SKIP_FILES:
                return match.group(0)
            return full_path + '.webp'

        content = pattern.sub(replace_ref, content)

        if content != original_content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_count += 1
            print(f"  ✓ Updated references in {os.path.basename(html_file)}")

    print(f"\n  Updated {updated_count} HTML files.")


def main():
    print("=" * 50)
    print("YOLO Living - Image Optimizer")
    print("=" * 50)

    # Step 1: Find all images
    images = find_images(ASSETS_DIR)
    print(f"\nFound {len(images)} images to convert.\n")

    # Step 2: Convert images
    print("Converting images to WebP...")
    total_original = 0
    total_new = 0
    converted = 0

    for img_path in images:
        name, ext = os.path.splitext(img_path)
        webp_path = name + '.webp'

        # Determine max width based on directory
        if 'icons' in img_path:
            max_w = ICON_MAX_WIDTH
        else:
            max_w = MAX_WIDTH

        original_size = os.path.getsize(img_path)
        total_original += original_size

        if convert_image(img_path, webp_path, max_w):
            total_new += os.path.getsize(webp_path)
            converted += 1

    print(f"\n  Converted {converted}/{len(images)} images.")
    print(f"  Total original: {total_original / (1024 * 1024):.1f} MB")
    print(f"  Total WebP:     {total_new / (1024 * 1024):.1f} MB")
    print(f"  Saved:          {(total_original - total_new) / (1024 * 1024):.1f} MB "
          f"({(1 - total_new / total_original) * 100:.0f}% reduction)\n")

    # Step 3: Update HTML references
    print("Updating HTML references...")
    update_html_references(PROJECT_ROOT)

    print("\n" + "=" * 50)
    print("Optimization complete!")
    print("Original files are preserved alongside .webp versions.")
    print("=" * 50)


if __name__ == '__main__':
    main()
