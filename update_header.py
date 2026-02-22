import os
import re

dir_path = '/Users/haneesh/yolowebsite26/'
files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

for file in files:
    file_path = os.path.join(dir_path, file)
    with open(file_path, 'r', encoding='utf-8', newline='') as f:
        content = f.read()

    # Replace all "Adventure Awaits" with "Inside YOLO"
    content = content.replace("Adventure Awaits", "Inside YOLO")

    # Move Blog in desktop nav
    pattern_desktop = r'([ \t]*)(<li class="dropdown">\s*<a href="[^"]*#company">Inside YOLO <span class="arrow-down">▼</span></a>\s*<ul class="dropdown-menu">\s*<li><a href="about\.html">About</a></li>\s*)<li><a href="blog\.html">Blog</a></li>\s*'
    
    def repl_desktop(m):
        indent = m.group(1)
        # We need to use the existing newlines, but we don't know if it's \r\n or \n. 
        # But we can just use the literal \r\n or \n by checking content.
        n = "\r\n" if "\r\n" in content else "\n"
        return f'{indent}<li><a href="blog.html">Blogs</a></li>{n}{indent}{m.group(2)}'
    
    content = re.sub(pattern_desktop, repl_desktop, content)

    # Move Blog in mobile nav
    pattern_mobile = r'([ \t]*)(<li>\s*<a href="#" class="mobile-dropdown-toggle">Inside YOLO ▼</a>\s*<ul class="mobile-sub-menu">\s*<li><a href="about\.html">About Us</a></li>\s*)<li><a href="blog\.html">Blog</a></li>\s*'

    def repl_mobile(m):
        indent = m.group(1)
        n = "\r\n" if "\r\n" in content else "\n"
        return f'{indent}<li><a href="blog.html">Blogs</a></li>{n}{indent}{m.group(2)}'
    
    content = re.sub(pattern_mobile, repl_mobile, content)

    # Footer update
    content = content.replace(">Blog</a>", ">Blogs</a>")

    with open(file_path, 'w', encoding='utf-8', newline='') as f:
        f.write(content)

print("Updates applied to all HTML files with correct line endings.")
