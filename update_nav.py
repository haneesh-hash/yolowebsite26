import os
import re

# Define the new header content
new_header = """    <header class="site-header">
        <nav class="nav-container">
            <!-- Left: Logo -->
            <div class="logo">
                <a href="index.html">
                    <img src="assets/icons/yolo_logo_horizontal.webp" alt="YOLO Living" class="logo-image">
                </a>
            </div>

            <ul class="nav-links">
                <li class="dropdown">
                    <a href="index.html#explore">Destinations <span class="arrow-down">▼</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="jispa.html">Jispa</a></li>
                        <li><a href="manali.html">Manali</a></li>
                        <li><a href="kasol.html">Kasol</a></li>
                    </ul>
                </li>
                <li><a href="experience.html">YOLO Experiences</a></li>
                <li class="dropdown">
                    <a href="index.html#company">Tribe <span class="arrow-down">▼</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="about.html">About</a></li>
                        <li><a href="blog.html">Blog</a></li>
                        <li><a href="franchise.html">Franchise</a></li>
                        <li><a href="work-with-us.html">Work With Us</a></li>
                    </ul>
                </li>
            </ul>

            <!-- Right: Navigation Links & CTA -->
            <div class="nav-right">

                <div class="nav-actions">
                    <a href="https://wa.me/917018591758" class="btn-whatsapp" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z">
                            </path>
                        </svg>
                    </a>
                    <a href="https://bookingengine.stayflexi.com/group-be/?groupId=28012" class="btn-primary"
                        target="_blank" rel="noopener noreferrer">Book Your Stay</a>
                </div>

                <!-- Mobile Menu Toggle -->
                <button class="mobile-menu-toggle" aria-label="Open Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    </header>"""

new_mobile_nav = """    <!-- Mobile Nav Drawer -->
    <div class="mobile-nav-drawer" role="dialog" aria-label="Mobile navigation">
        <ul class="mobile-nav-links">
            <li><a href="experience.html">Experiences</a></li>
            <li>
                <a href="#" class="mobile-dropdown-toggle">Destinations ▼</a>
                <ul class="mobile-sub-menu">
                    <li><a href="jispa.html">Jispa</a></li>
                    <li><a href="manali.html">Manali</a></li>
                    <li><a href="kasol.html">Kasol</a></li>
                </ul>
            </li>
            <li>
                <a href="#" class="mobile-dropdown-toggle">Tribe ▼</a>
                <ul class="mobile-sub-menu">
                    <li><a href="about.html">About Us</a></li>
                    <li><a href="blog.html">Blog</a></li>
                    <li><a href="franchise.html">Franchise</a></li>
                    <li><a href="work-with-us.html">Work with us</a></li>
                </ul>
            </li>
            <li><a href="#" class="btn-primary" id="booking-trigger-mobile">Book Your Stay</a></li>
        </ul>
    </div>"""

# List of files to update (excluding index.html which is already updated, and admin files)
files_to_update = [
    "about.html",
    "blog.html",
    "experience.html",
    "franchise.html",
    "homestead-manali.html",
    "homestead.html",
    "jispa.html",
    "kasol.html",
    "manali.html",
    "outdoors.html",
    "social.html",
    "work-with-us.html"
]

base_dir = "/Users/haneesh/yolowebsite26"

for filename in files_to_update:
    filepath = os.path.join(base_dir, filename)
    if os.path.exists(filepath):
        print(f"Updating {filename}...")
        with open(filepath, 'r') as f:
            content = f.read()
        
        # 1. Update Header
        pattern_header = re.compile(r'<header class="site-header">.*?</header>', re.DOTALL)
        if pattern_header.search(content):
            content = pattern_header.sub(new_header, content)
            print(f"  - Updated Header")
        else:
            print(f"  - Header not found")

        # 2. Update Mobile Nav Drawer
        pattern_mobile = re.compile(r'<div class="mobile-nav-drawer"[\s\S]*?</div>', re.DOTALL)
        if pattern_mobile.search(content):
            content = pattern_mobile.sub(new_mobile_nav, content)
            print(f"  - Updated Mobile Nav")
        else:
            # Fallback: finding similar structure if not exact match (optional, but sticking to exact replacement for safety)
            print(f"  - Mobile Nav not found")

        # 3. Update Footer Heading "Company" -> "Tribe"
        # Using simple replace for the footer heading <h4>Company</h4>
        if "<h4>Company</h4>" in content:
            content = content.replace("<h4>Company</h4>", "<h4>Tribe</h4>")
            print(f"  - Updated Footer Heading")
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Saved changes to {filename}")
    else:
        print(f"File {filename} not found")
