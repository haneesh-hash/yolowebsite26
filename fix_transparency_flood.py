from PIL import Image
import sys

def flood_fill_transparency(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Get the background color from the top-left corner
        bg_color = img.getpixel((0, 0))
        
        # Function to check if a pixel matches the background within tolerance
        def match(pixel, target, tol):
            return all(abs(p - t) <= tol for p, t in zip(pixel[:3], target[:3]))

        # Flood fill algorithm (iterative)
        stack = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        visited = set()
        
        datas = img.load()
        
        while stack:
            x, y = stack.pop()
            
            if (x, y) in visited:
                continue
            
            visited.add((x, y))
            
            current_pixel = datas[x, y]
            if match(current_pixel, bg_color, tolerance):
                datas[x, y] = (0, 0, 0, 0) # Transparent
                
                neighbors = [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
                for nx, ny in neighbors:
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) not in visited:
                           stack.append((nx, ny))
    
        img.save(output_path, "PNG")
        print(f"Successfully saved transparent image to {output_path}")

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    # Use the TRIMMED version as input to preserve the crop
    flood_fill_transparency('/Users/haneesh/yolowebsite26/assets/icons/header_logo.png', '/Users/haneesh/yolowebsite26/assets/icons/header_logo.png')
