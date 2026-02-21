from PIL import Image
import os

def fix_logo_transparency(input_path, output_path):
    print(f"Processing: {input_path}")
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        
        # Thresholds
        # White is (255, 255, 255)
        # Greys in checkerboards are often around (204, 204, 204) to (240, 240, 240)
        # We'll target anything that is neutral (r~=g~=b) and high brightness
        
        for item in datas:
            r, g, b, a = item
            
            # Check for pure white or near white
            if r > 240 and g > 240 and b > 240:
                newData.append((255, 255, 255, 0))
                continue
                
            # Check for grey checkerboard squares
            # They are usually neutral grey
            if (abs(r-g) < 15 and abs(g-b) < 15 and abs(r-b) < 15) and (r > 190 and g > 190 and b > 190):
                 newData.append((255, 255, 255, 0))
                 continue

            newData.append(item)

        img.putdata(newData)
        img.save(output_path, "WEBP")
        print(f"Successfully saved transparent logo to {output_path}")

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    # Target the webp file directly as recognized in the HTML
    input_file = '/Users/haneesh/yolowebsite26/assets/icons/header_logo.webp'
    
    # We'll overwrite it to fix it in place for the site
    # But let's make a backup first just in case
    if os.path.exists(input_file):
        backup_file = input_file + ".bak"
        import shutil
        shutil.copy2(input_file, backup_file)
        print(f"Backed up original to {backup_file}")
        
    fix_logo_transparency(input_file, input_file)
