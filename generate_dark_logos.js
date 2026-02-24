const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function getOriginalSize(logoName) {
    // Hardcoded sizes based on previous run
    if (logoName === 'logo_social') return { width: 1804, height: 1004 };
    if (logoName === 'logo_outdoors') return { width: 1804, height: 1004 };
    if (logoName === 'logo_homes') return { width: 1804, height: 1006 };
    return { width: 1804, height: 1004 };
}

async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Read the HTML containing all SVGs
    let htmlContent = fs.readFileSync('logos_export.html', 'utf8');

    // The SVGs use #212121 for text and hiker, which will be invisible on dark background
    // Let's replace #212121 with #ffffff for the dark versions
    htmlContent = htmlContent.replace(/#212121/g, '#ffffff');

    // Create dark logos output directory in Downloads
    const downloadsDir = path.join(os.homedir(), 'Downloads', 'YOLO_Dark_Logos');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const logos = ['logo_social', 'logo_outdoors', 'logo_homes'];

    for (const id of logos) {
        // Extract the SVG content for the specific logo using a simple regex
        const regex = new RegExp(`<div id="${id}"[^>]*>([\\s\\S]*?)<\\/div>`);
        const match = htmlContent.match(regex);

        if (match && match[1]) {
            let svgContent = match[1];

            // Generate full HTML page for rendering just this logo
            const renderHtml = `
            <!doctype html>
            <html>
                <head>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background: #121212; /* Dark background */
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100vw;
                            height: 100vh;
                        }
                        svg {
                            width: auto;
                            height: 60%; /* Scale it appropriately, but GMB might need it larger */
                            max-width: 90%;
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    ${svgContent}
                </body>
            </html>
            `;

            // Get target dimensions
            const size = await getOriginalSize(id);
            await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });

            await page.setContent(renderHtml, { waitUntil: 'load' });

            const outPath = path.join(downloadsDir, `${id}_dark.png`);
            await page.screenshot({ path: outPath, omitBackground: false });
            console.log(`Saved ${outPath} with dimensions ${size.width}x${size.height}`);
        } else {
            console.log(`Could not find SVG for ${id}`);
        }
    }

    await browser.close();
}

run().catch(console.error);
