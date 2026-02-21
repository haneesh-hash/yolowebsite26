from PIL import Image
import os

def remove_white_background(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully saved transparent image to {output_path}")
    except Exception as e:
        print(f"Error processing image: {e}")

# Process the Primary Logo
input_pk = "/Users/haneesh/yolowebsite26/assets/icons/yolo_logo_primary.png"
# Overwrite or save as new? Let's overwrite to keep filenames simple for HTML
# But safer to save to a temp and then move.
output_pk = "/Users/haneesh/yolowebsite26/assets/icons/yolo_logo_primary_transparent.png"

remove_white_background(input_pk, output_pk)
