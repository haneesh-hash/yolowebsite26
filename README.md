# The YOLO Living

Luxury hostels and glamping in the Himalayas. Marketing website for YOLO Living properties in Manali, Kasol, and Jispa.

## Local Development

```bash
npm install
npm start        # Starts Express server on http://localhost:3000
```

The Express server serves static files and provides an authenticated image upload endpoint at `/admin`.

## Build

```bash
npm run build    # Minifies CSS (style.css) and JS (script.js) to dist/
npm run lint     # Runs ESLint on script.js and server.js
npm run format   # Runs Prettier on HTML, CSS, and JS files
```

## Deploy to Hostinger

```bash
bash prepare_deployment.sh
```

This builds minified assets, packages everything into `website_deploy.zip` (excluding dev files, node_modules, and server code), and outputs a zip ready for upload to Hostinger.

## Project Structure

```
index.html              Homepage
about.html              About Us
manali.html             Manali destination hub
kasol.html              Kasol destination hub
jispa.html              Jispa destination hub
social.html             YOLO Social (Old Manali hostel)
homes.html        YOLO Homes Kasol
homes-manali.html YOLO Homes Manali
outdoors.html           YOLO Outdoors Jispa (glamping)
experience.html         Activities & adventures
blog.html               Blog
franchise.html          Franchise opportunities
work-with-us.html       Careers

style.css               Main stylesheet (self-hosted fonts, CSS variables)
script.js               Interactions (GSAP animations, tilt cards, booking overlay)
server.js               Express backend (static files + image upload)

assets/
  fonts/                Self-hosted Inter + Outfit woff2 files
  images/               WebP images and hero video
  icons/                Favicon and brand icons

robots.txt              Search engine crawling rules
sitemap.xml             XML sitemap for all 13 pages
```

## Brand Guidelines

See [brandguidelines.md](brandguidelines.md) for color palette, typography, and tone of voice.

## Admin

The `/admin` route provides image upload functionality, protected by HTTP Basic Auth. Set credentials via environment variables:

```bash
ADMIN_USER=admin
ADMIN_PASSWORD=your-password
```
