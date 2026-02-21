from PIL import Image, ImageDraw

def flood_fill_transparency(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Get the background color from the top-left corner
        bg_color = img.getpixel((0, 0))
        
        # Function to check if a pixel matches the background within tolerance
        def match(pixel, target, tol):
            return all(abs(p - t) <= tol for p, t in zip(pixel[:3], target[:3]))

        # Flood fill algorithm
        # We'll use a set of visited pixels and a stack for the fill
        # Starting points: all 4 corners
        stack = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        visited = set()
        
        datas = img.load()
        
        while stack:
            x, y = stack.pop()
            
            if (x, y) in visited:
                continue
            
            visited.add((x, y))
            
            # If current pixel matches background, make it transparent
            current_pixel = datas[x, y]
            if match(current_pixel, bg_color, tolerance):
                datas[x, y] = (0, 0, 0, 0) # Transparent
                
                # Check neighbors
                neighbors = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
                for nx, ny in neighbors:
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) not in visited:
                           stack.append((nx, ny))
            else:
                 # It's an edge or object, stop filling this branch
                 pass

        img.save(output_path, "PNG")
        print(f"Successfully saved flood-filled transparent image to {output_path}")

    except Exception as e:
        print(f"Error processing image: {e}")

# Process the Primary Logo
# Note: copying it back from the original artifacts to ensure we have a fresh start with white bg
# But wait, the current file in assets/icons/yolo_logo_primary.png might already be messed up?
# I'll re-copy from original artifact first.
original_artifact = "/Users/haneesh/.gemini/antigravity/brain/be90cae5-a7d8-4e45-8602-e899a5ca0898/logo_primary_polished_1771015536912.png" 
# Actually let's use the one from catalog Option 7? 
# Wait, Option 7 was "logo_classic_refined_1771002529946.png".
# The user asked for "Option 7". In "Finalizing Brand Kit", I mapped Option 7 to "logo_classic_refined_1771002529946.png" (Primary).
# In "Final Design Review & Polish", I generated "logo_primary_polished_1771015536912.png".
# But then user REJECTED changes. So we reverted to "logo_classic_refined_1771002529946.png".
# So "yolo_logo_primary.png" *should* be "logo_classic_refined...".

target_file = "/Users/haneesh/yolowebsite26/assets/icons/yolo_logo_primary.png"

# We run this on the target file itself
flood_fill_transparency(target_file, target_file)
