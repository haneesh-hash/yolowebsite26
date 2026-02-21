import os
import re
from urllib.parse import unquote

def check_file_exists(base_dir, path):
    # Remove query parameters and anchors
    path = path.split('?')[0].split('#')[0]
    
    # Handle absolute paths (relative to site root) and relative paths
    if path.startswith('/'):
        full_path = os.path.join(base_dir, path.lstrip('/'))
    else:
        full_path = os.path.join(base_dir, path)
        
    return os.path.exists(full_path) or os.path.exists(unquote(full_path))

def scan_html_files(directory):
    html_files = [f for f in os.listdir(directory) if f.endswith('.html')]
    report = []
    
    print(f"Scanning {len(html_files)} HTML files in {directory}...\n")
    
    for filename in html_files:
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        print(f"Checking {filename}...")
        errors = []
        
        # 1. Check Links (a href)
        links = re.findall(r'<a\s+(?:[^>]*?\s+)?href=["\']([^"\']*)["\']', content)
        for link in links:
            if link.startswith(('http', 'https', 'mailto:', 'tel:', '#')):
                continue
            if not check_file_exists(directory, link):
                errors.append(f"Broken Link: {link}")

        # 2. Check Images (img src)
        images = re.findall(r'<img\s+(?:[^>]*?\s+)?src=["\']([^"\']*)["\']', content)
        for img in images:
            if img.startswith(('http', 'https', 'data:')):
                continue
            if not check_file_exists(directory, img):
                errors.append(f"Broken Image: {img}")
                
        # 3. Check Scripts (script src)
        scripts = re.findall(r'<script\s+(?:[^>]*?\s+)?src=["\']([^"\']*)["\']', content)
        for script in scripts:
            if script.startswith(('http', 'https')):
                continue
            if not check_file_exists(directory, script):
                errors.append(f"Broken Script: {script}")

        # 4. Check Styles (link href)
        styles = re.findall(r'<link\s+(?:[^>]*?\s+)?href=["\']([^"\']*)["\']', content)
        for style in styles:
            if style.startswith(('http', 'https')):
                continue
            if "stylesheet" in content and not check_file_exists(directory, style) and style.endswith('.css'):
                 # Simple check, might catch google fonts if not careful, but filtered by .css ext for local
                 errors.append(f"Broken Stylesheet: {style}")

        # 5. Check SEO Meta Tags
        if '<meta name="description"' not in content:
            errors.append("Missing Meta Description")
        
        if '<title>' not in content:
            errors.append("Missing Title Tag")

        if errors:
            report.append(f"❌ {filename}:\n  - " + "\n  - ".join(errors))
        else:
            report.append(f"✅ {filename}: Passed")
            
    print("\n" + "="*40 + "\nCHECK COMPLETE\n" + "="*40)
    for line in report:
        print(line)

if __name__ == "__main__":
    scan_html_files("/Users/haneesh/yolowebsite26")
