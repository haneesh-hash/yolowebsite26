from PIL import Image

def apply_header_bg(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        
        # Header color: rgba(255, 255, 255, 0.8) -> (255, 255, 255, 204)
        header_bg = (255, 255, 255, 204)
        
        # We'll target anything that looks like background (white, grey, or transparent)
        # and replace it with the header color.
        
        for item in datas:
            # item is (R, G, B, A)
            r, g, b, a = item
            
            # Is it transparent?
            if a < 255: 
                # If it's fully or partially transparent, force it to header_bg
                # But wait, if it's the edge of the text, we might want to blend?
                # For now, let's just fill the background.
                if a == 0:
                    newData.append(header_bg)
                    continue

            # Is it white or light grey (checkerboard)?
            # Targets: White (255,255,255), Grey (204,204,204 to 240,240,240)
            if (r > 200 and g > 200 and b > 200):
                 newData.append(header_bg)
            else:
                 newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Saved logo with header background to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    apply_header_bg('/Users/haneesh/yolowebsite26/assets/icons/header_logo.png', '/Users/haneesh/yolowebsite26/assets/icons/header_logo.png')
