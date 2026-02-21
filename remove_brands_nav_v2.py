import os

files_to_update = [
    "index.html",
    "experience.html",
    "jispa.html",
    "manali.html",
    "kasol.html",
    "about.html",
    "blog.html",
    "work-with-us.html",
    "franchise.html",
    "social.html",
    "homestead.html",
    "homestead-manali.html",
    "outdoors.html"
]

# We need to match the block exactly as it appears in the files.
# Based on previous index.html view, it seems to have standard indentation.
# I will use a slightly more robust approach by reading the file and looking for the start and end markers of this specific list item
# or just fuzzy matching the content if exact string match fails due to whitespace differences.

target_block_content = """<a href="#brands">Our Brands <span class="arrow-down">▼</span></a>"""

def remove_brands_dropdown(content):
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if target_block_content in line:
            # Found the identifying line. The <li> starts one line before (usually) and ends after the </ul></li>
            # Let's look backwards for <li class="dropdown">
            start_index = len(new_lines) - 1
            # Verify the previous line is indeed the start of this dropdown.
            # In the user's formatted code, it likely is.
            if start_index >= 0 and '<li class="dropdown">' in new_lines[start_index]:
                # We found the start. Now find the end </li>
                # The structure is:
                # <li class="dropdown">
                #     <a ...>...</a>
                #     <ul ...>
                #         ...
                #     </ul>
                # </li>
                
                # We need to skip lines until we find the closing </li> for this block.
                # Since we are inside the loop, we just advance 'i' until we see the closing /li matching this indentation level preferably.
                # But simple counting of <ul> and </ul> might be safer if nested, though here it's simple.
                # Let's look for the closing </li> that matches this block.
                
                # Since the previous line (start_index) was added to new_lines, we need to pop it!
                new_lines.pop() 
                
                # Now skip lines from 'i' onwards until we close this <li>
                # We are at the line with <a> tag.
                # We expect a <ul> next, then <li>s, then </ul>, then </li>
                
                # Simple heuristic for this specific codebase: scan until we see </li> indented same way or just the next </li> after </ul>
                
                # Let's just consume lines until we see the closing </li> 
                # Be careful not to eat too much.
                
                # Current line 'i' is the <a> link.
                i += 1
                while i < len(lines):
                    curr = lines[i]
                    # The closing tag for this dropdown
                    if "</li>" in curr and "</ul>" not in curr: # potentially the end
                         # This is risky if strict formatting isn't followed.
                         # Let's use the explicit block string matching as fallback/primary if possible because it's safer if we know the exact string.
                         pass
                    i += 1
                    # Actually, let's revert to string replacement if possible, it's safer for "exact" replacements.
                
                # RESTARTING LOGIC TO USE EXACT STRING REPLACEMENT
                break 
            
        new_lines.append(line)
        i += 1
    return content # Fallback if logic above is too complex to do correctly without regex/parsing.

# Let's use the exact string block we used to restore it, as that should be what is in the files now.
target_block = """
                <li class="dropdown">
                    <a href="#brands">Our Brands <span class="arrow-down">▼</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="social.html">YOLO Social</a></li>
                        <li><a href="homestead.html">YOLO Homestead</a></li>
                        <li><a href="outdoors.html">YOLO Outdoors</a></li>
                    </ul>
                </li>"""

# We also need to handle potential whitespace variations if any file was manually edited differently, 
# but since we just restored them with a script using this block, they should be identical.
# Exception: index.html might have slightly different indentation if it wasn't processed by the restore script (it was processed).

for file_name in files_to_update:
    file_path = os.path.join(os.getcwd(), file_name)
    if not os.path.exists(file_path):
        print(f"File not found: {file_name}")
        continue
    
    with open(file_path, 'r') as f:
        content = f.read()

    # Try to remove the block
    if target_block in content:
        new_content = content.replace(target_block, "")
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Removed brands nav from {file_name}")
    elif target_block.strip() in content: # Try without leading newline
        new_content = content.replace(target_block.strip(), "")
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Removed brands nav (stripped) from {file_name}")
    else:
        # Debug: check why it didn't match. Maybe indentation?
        # Let's try to find it with flexible whitespace regex if needed, but for now just report.
        print(f"Target block NOT found in {file_name}. Checking manual signature...")
        
        # Fallback: simple line-by-line check for the header link
        if 'href="#brands"' in content:
            print(f"  -> WARNING: 'Our Brands' link still present in {file_name} but block didn't match exactly.")
