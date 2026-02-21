
import os
import re
from urllib.parse import unquote

def check_links(start_dir):
    broken_links = []
    
    for root, dirs, files in os.walk(start_dir):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Find all href attributes
                    links = re.findall(r'href=["\'](.*?)["\']', content)
                    
                    for link in links:
                        # Skip empty links, anchors, and external links for now
                        if not link or link.startswith('#') or link.startswith('http') or link.startswith('mailto:') or link.startswith('tel:'):
                            continue
                        
                        # Handle potential query params or anchors in the link
                        clean_link = link.split('#')[0].split('?')[0]
                        
                        # Resolve relative paths
                        target_path = os.path.join(root, clean_link)
                        
                        if not os.path.exists(target_path):
                            broken_links.append(f"File: {file} -> Broken Link: {link}")

    if broken_links:
        print("Found broken links:")
        for broken in broken_links:
            print(broken)
    else:
        print("No broken internal links found.")

if __name__ == "__main__":
    check_links(".")
