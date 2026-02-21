from PIL import Image

def remove_checkerboard(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        # Checkered patterns are usually pure white (255,255,255) and light grey (often around 204 or 230)
        # We will target these specific ranges aggressively.
        
        # Threshold for "grey" squares (e.g., #CCCCCC is (204,204,204), #E0E0E0 is (224,224,224))
        grey_threshold_low = 200 
        
        for item in datas:
            # item is (R, G, B, A)
            r, g, b, a = item
            
            # Is it white?
            is_white = (r > 250 and g > 250 and b > 250)
            
            # Is it a light grey square? (r, g, b are close to each other and high value)
            is_grey = (r > grey_threshold_low and g > grey_threshold_low and b > grey_threshold_low and
                       abs(r - g) < 10 and abs(g - b) < 10 and abs(r - b) < 10)

            if is_white or is_grey:
                newData.append((255, 255, 255, 0)) # Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Saved cleaned image to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Apply to existing header logo
    remove_checkerboard('/Users/haneesh/yolowebsite26/assets/icons/header_logo.png', '/Users/haneesh/yolowebsite26/assets/icons/header_logo.png')
